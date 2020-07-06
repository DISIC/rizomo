import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import AppRoles from './users/users';

class KeyCloakClient {
  constructor() {
    this.kcURL = Meteor.settings.public.keycloakUrl;
    this.kcRealm = Meteor.settings.public.keycloakRealm;
    this.clientId = null;
    this.adminsGroupId = null;
    this.token = null;
    this.refreshToken = null;
    this._ensureClientId = this._ensureClientId.bind(this);
    this._setToken = this._setToken.bind(this);
    this._setRefreshToken = this._setRefreshToken.bind(this);
    this._expire = this._expire.bind(this);
    this._expireRefresh = this._expireRefresh.bind(this);
    this._checkToken = this._checkToken.bind(this);
    // initialize client id and check that we can get tokens
    this._getToken().then((initToken) => {
      if (initToken) {
        console.log('Keycloak: API client initialized');
      }
    });
  }

  _authenticate() {
    const { adminUser } = Meteor.settings.keycloak;
    const { adminPassword } = Meteor.settings.keycloak;
    return axios.post(
      `${this.kcURL}/realms/master/protocol/openid-connect/token`,
      `username=${adminUser}&password=${adminPassword}&grant_type=password&client_id=admin-cli`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  _refreshToken() {
    return axios.post(
      `${this.kcURL}/realms/master/protocol/openid-connect/token`,
      `refresh_token=${this.refreshToken}&grant_type=refresh_token&client_id=admin-cli`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  _expire() {
    this.token = null;
  }

  _expireRefresh() {
    this.refreshToken = null;
  }

  _setToken(token, timeout) {
    this.token = token;
    // reset this.token 5 seconds before it expires
    setTimeout(this._expire, (timeout - 5) * 1000);
  }

  _setRefreshToken(refreshToken, timeout) {
    this.refreshToken = refreshToken;
    // reset this.refreshToken 10 seconds before token expires
    setTimeout(this._expireRefresh, (timeout - 10) * 1000);
  }

  _checkToken() {
    if (this.token) return Promise.resolve(this.token);
    if (this.refreshToken)
      return this._refreshToken().then((response) => {
        const newToken = response.data.access_token;
        this._setToken(newToken, response.data.expires_in);
        this._setRefreshToken(response.data.refresh_token, response.data.refresh_expires_in);
        return newToken;
      });
    return this._authenticate().then((response) => {
      console.log('Keycloak : new access token received');
      const newToken = response.data.access_token;
      this._setToken(newToken, response.data.expires_in);
      this._setRefreshToken(response.data.refresh_token, response.data.refresh_expires_in);
      return newToken;
    });
  }

  _getToken() {
    return this._checkToken()
      .then((newToken) => {
        // check that clientId is set in case keycloak was not available at startup
        return this._ensureClientId(newToken)
          .then(() => this._ensureAdminsId(newToken))
          .then(() => Promise.resolve(newToken));
      })
      .catch((error) => {
        console.log('** Keycloak: could not get token, please check settings **');
        console.log(error.response && error.response.data ? error.response.data : error);
        return null;
      });
  }

  _ensureClientId(token) {
    if (this.clientId === null) {
      return axios
        .get(`${this.kcURL}/admin/realms/${this.kcRealm}/clients`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          this.clientId = response.data.find((client) => client.clientId === Meteor.settings.keycloak.client).id;
          console.log(`Keycloak: client ID found (${this.clientId})`);
          return this.clientId;
        })
        .catch((error) => {
          console.log('** Keycloak: could not find client Id, please check settings **');
          console.log(error.response && error.response.data ? error.response.data : error);
          return null;
        });
    }
    return Promise.resolve(this.clientId);
  }

  _ensureAdminsId(token) {
    if (this.adminsGroupId === null) {
      return this._getGroupId('admins', token).then((groupId) => {
        if (groupId) {
          this.adminsGroupId = groupId;
          return this.adminsGroupId;
        }
        return this._addGroup('admins', token)
          .then(() => this._getGroupId('admins', token))
          .then((newGroupId) => {
            this.adminsGroupId = newGroupId;
            return this.adminsGroupId;
          });
      });
    }
    return Promise.resolve(this.adminsGroupId);
  }

  _getGroupId(name, token) {
    return axios
      .get(`${this.kcURL}/admin/realms/${this.kcRealm}/groups`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const kcGroup = response.data.find((elem) => elem.name === name);
        return kcGroup === undefined ? undefined : kcGroup.id;
      });
  }

  _getRoleId(name, token) {
    return axios
      .get(`${this.kcURL}/admin/realms/${this.kcRealm}/clients/${this.clientId}/roles`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const kcRole = response.data.find((elem) => elem.name === name);
        return kcRole === undefined ? undefined : kcRole.id;
      });
  }

  _addRole(name, token) {
    return axios.post(
      `${this.kcURL}/admin/realms/${this.kcRealm}/clients/${this.clientId}/roles`,
      {
        name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  _addGroup(groupName, token) {
    return this._addRole(groupName, token).then(() => {
      return axios
        .post(
          `${this.kcURL}/admin/realms/${this.kcRealm}/groups`,
          {
            name: groupName,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(() => this._getGroupId(groupName, token))
        .then((groupId) => {
          console.log(`Keycloak: group ${groupName} added (id ${groupId})`);
          return this._getRoleId(groupName, token).then((roleId) => {
            return axios.post(
              `${this.kcURL}/admin/realms/${this.kcRealm}/groups/${groupId}/role-mappings/clients/${this.clientId}`,
              [{ name: groupName, id: roleId }],
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          });
        });
    });
  }

  addGroupWithRoles(group) {
    AppRoles.filter((role) => role !== 'candidate').forEach((role) => {
      const groupName = `${role}_${group.name}`;
      this._getToken().then((token) => {
        this._addGroup(groupName, token).catch((error) => {
          console.log(`Keycloak : ERROR adding group ${groupName}`);
          console.log(error.response && error.response.data ? error.response.data : error);
        });
      });
    });
  }

  addGroup(group) {
    this._getToken().then((token) => {
      this._addGroup(group.name, token).catch((error) => {
        console.log(`Keycloak : ERROR adding group ${group.name}`);
        console.log(error.response && error.response.data ? error.response.data : error);
      });
    });
  }

  _removeRole(name, token) {
    return axios.delete(`${this.kcURL}/admin/realms/${this.kcRealm}/clients/${this.clientId}/roles/${name}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  _removeGroup(groupName) {
    this._getToken()
      .then((token) => {
        // search group id
        return this._getGroupId(groupName, token).then((groupId) => {
          if (groupId === undefined) {
            console.log(`Keycloak: could not find group ${groupName}`);
            return null;
          }
          // delete associated role
          return this._removeRole(groupName, token).then(() => {
            // delete group
            return axios
              .delete(`${this.kcURL}/admin/realms/${this.kcRealm}/groups/${groupId}`, {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => console.log(`Keycloak: group ${groupName} removed`));
          });
        });
      })
      .catch((error) =>
        console.log(
          `Keycloak: Error removing group ${groupName}`,
          error.response && error.response.data ? error.response.data : error,
        ),
      );
  }

  removeGroupWithRoles(group) {
    AppRoles.filter((role) => role !== 'candidate').forEach((role) => {
      const groupName = `${role}_${group.name}`;
      this._removeGroup(groupName);
    });
  }

  removeGroup(group) {
    this._removeGroup(group.name);
  }

  setAdmin(userId) {
    const groupName = `admins`;
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._getToken()
        .then((token) =>
          this._getGroupId(groupName, token).then((groupId) => {
            return axios
              .put(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, '', {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                console.log(`Keycloak: user ${userId} added to admins`);
              });
          }),
        )
        .catch((error) => {
          console.log(`Keycloak : ERROR adding user ${userId} to admins`);
          console.log(error.response && error.response.data ? error.response.data : error);
        });
    } else {
      console.log(`Keycloak: could not find Keycloak ID for user ${userId}`);
    }
  }

  unsetAdmin(userId) {
    const groupName = `admins`;
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._getToken()
        .then((token) =>
          this._getGroupId(groupName, token).then((groupId) =>
            axios
              .delete(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                console.log(`Keycloak: user ${userId} removed from admins`);
              }),
          ),
        )
        .catch((error) => {
          console.log(`Keycloak : ERROR removing user ${userId} from admins`);
          console.log(error.response && error.response.data ? error.response.data : error);
        });
    } else {
      console.log(`Keycloak: could not find Keycloak ID for user ${userId}`);
    }
  }

  setRole(userId, roleName) {
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._getToken()
        .then((token) =>
          this._getGroupId(roleName, token).then((groupId) =>
            axios
              .put(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, '', {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                console.log(`Keycloak: group ${roleName} added to user ${userId}`);
              }),
          ),
        )
        .catch((error) => {
          console.log(`Keycloak : ERROR adding group ${roleName} to user ${userId}`);
          console.log(error.response && error.response.data ? error.response.data : error);
        });
    } else {
      console.log(`Keycloak: could not find Keycloak ID for user ${userId}`);
    }
  }

  unsetRole(userId, roleName) {
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._getToken()
        .then((token) =>
          this._getGroupId(roleName, token).then((groupId) =>
            axios
              .delete(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                console.log(`Keycloak: group ${roleName} removed from user ${userId}`);
              }),
          ),
        )
        .catch((error) => {
          console.log(`Keycloak : ERROR removing group ${roleName} from user ${userId}`);
          console.log(error.response && error.response.data ? error.response.data : error);
        });
    } else {
      console.log(`Keycloak: could not find Keycloak ID for user ${userId}`);
    }
  }
}

const kcClient = Meteor.isServer && Meteor.settings.public.enableKeycloak ? new KeyCloakClient() : null;

export default kcClient;
