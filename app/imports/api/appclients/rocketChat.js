import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import Groups from '../groups/groups';
import logServer from '../logging';
import { genRandomPassword } from '../utils';

const rcEnabled = Meteor.settings.public.groupPlugins.rocketChat.enable;

class RocketChatClient {
  constructor() {
    this.rcURL = `${Meteor.settings.public.groupPlugins.rocketChat.URL}/api/v1`;
    this.token = null;
    this.adminId = null;
    this._setToken = this._setToken.bind(this);
    this._expire = this._expire.bind(this);
    this._checkToken = this._checkToken.bind(this);
    // initialize client id and check that we can get tokens
    this._getToken().then((initToken) => {
      if (initToken) {
        logServer(i18n.__('api.rocketChat.initClient'));
      }
    });
  }

  _authenticate() {
    const { rocketChatUser, rocketChatPassword } = Meteor.settings.rocketChat;
    return axios.post(
      `${this.rcURL}/login`,
      { user: rocketChatUser, password: rocketChatPassword },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
  }

  _expire() {
    const previousToken = this.token;
    this.token = null;
    // call Rocket Chat API to invalidate this token
    return axios
      .post(
        `${this.rcURL}/logout`,
        {},
        {
          headers: {
            Accept: 'application/json',
            'X-User-Id': this.adminId,
            'X-Auth-Token': previousToken,
          },
        },
      )
      .then((response) => {
        if (response.data.status === 'success') {
          logServer(i18n.__('api.rocketChat.logout'));
        } else {
          logServer(i18n.__('api.rocketChat.logoutError'), 'error');
        }
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.logoutError'), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
      });
  }

  _setToken(token, timeout) {
    this.token = token;
    // reset this.token 5 seconds before it expires
    setTimeout(this._expire, (timeout - 5) * 1000);
  }

  _checkToken() {
    if (this.token) return Promise.resolve(this.token);
    return this._authenticate().then((response) => {
      logServer('RocketChat : new token received');
      const newToken = response.data.data.authToken;
      this.adminId = response.data.data.userId;
      // Rocket Chat does not indicate token expiration (set to 15 minutes)
      this._setToken(newToken, 900);
      return newToken;
    });
  }

  _getToken() {
    return this._checkToken()
      .then((newToken) => Promise.resolve(newToken))
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.tokenError'), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return null;
      });
  }

  getGroup(slug) {
    return this._getToken()
      .then((token) => {
        return axios
          .get(`${this.rcURL}/groups.info`, {
            params: {
              roomName: slug,
            },
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-User-Id': this.adminId,
              'X-Auth-Token': token,
            },
          })
          .then((response) => {
            if (response.data && response.data.success === true) {
              return response.data.group;
            }
            return null;
          });
      })
      .catch(() => {
        return null;
      });
  }

  createGroup(name, callerId) {
    return this._getToken()
      .then((token) => {
        return axios
          .post(
            `${this.rcURL}/groups.create`,
            {
              // ATTENTION : les caractères 'spéciaux', accentués et les espace sont refusés ...
              name,
              // Retrouver et ajouter automatiquement les membres du groupe (ou canaux publics) ?
              members: [],
              readOnly: false,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-User-Id': this.adminId,
                'X-Auth-Token': token,
              },
            },
          )
          .then((response) => {
            if (response.data && response.data.success === true) {
              logServer(i18n.__('api.rocketChat.groupAdded', { name }));
              return response.data.group;
            }
            logServer(`${i18n.__('api.rocketChat.groupAddError', { name })} (${response.error})`, 'error', callerId);
            return null;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.groupAddError', { name }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  renameGroup(rcGroup, slug, callerId) {
    return this._getToken()
      .then((token) => {
        return axios
          .post(
            `${this.rcURL}/groups.rename`,
            {
              roomId: rcGroup._id,
              name: slug,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-User-Id': this.adminId,
                'X-Auth-Token': token,
              },
            },
          )
          .then((response) => {
            if (response.data && response.data.success === true) {
              logServer(i18n.__('api.rocketChat.groupRenamed', { slug }));
              return response.data.group;
            }
            logServer(`${i18n.__('api.rocketChat.groupRenameError', { slug })} (${response.error})`, 'error', callerId);
            return null;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.groupRenameError', { slug }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  removeGroup(name, callerId) {
    return this._getToken()
      .then((token) => {
        return axios
          .post(
            `${this.rcURL}/groups.delete`,
            {
              roomName: name,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-User-Id': this.adminId,
                'X-Auth-Token': token,
              },
            },
          )
          .then((response) => {
            if (response.data.success === true) {
              logServer(i18n.__('api.rocketChat.groupRemoved', { name }));
            } else {
              logServer(
                `${i18n.__('api.rocketChat.groupRemoveError', { name })} (${response.error})`,
                'error',
                callerId,
              );
            }
            return response.data.success;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.groupRemoveError', { name }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  _getUserByUsername(username) {
    return this._getToken()
      .then((token) => {
        return axios
          .get(`${this.rcURL}/users.list`, {
            params: {
              query: { username },
            },
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-User-Id': this.adminId,
              'X-Auth-Token': token,
            },
          })
          .then((response) => {
            if (response.data && response.data.success === true) {
              if (response.data.users.length > 0) return response.data.users[0];
              return null;
            }
            logServer(`${i18n.__('api.rocketChat.getUserError')} (${response.error})`, 'error');
            return null;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.getUserError'), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return null;
      });
  }

  inviteUser(groupId, username, callerId) {
    // role: boolean to set user as owner, moderator or member of this group
    return this._getToken()
      .then((token) =>
        this._getUserByUsername(username).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.invite`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.userInvited', { groupId, username }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.userInviteError', { groupId, username })} (${response.data.error})`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.userInviteError', { groupId, username }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  setRole(groupId, username, role, callerId) {
    // role: boolean to set user as owner or moderator of a group
    const APIUrl = role === 'owner' ? 'addOwner' : 'addModerator';
    const displayRole = i18n.__(`api.rocketChat.${role}`);
    return this._getToken()
      .then((token) =>
        this._getUserByUsername(username).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.${APIUrl}`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.roleSet', { groupId, username, role: displayRole }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.setRoleError', { groupId, username, role: displayRole })} (${
                    response.data.error
                  })`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.setRoleError', { groupId, username, role: displayRole }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  unsetRole(groupId, username, role, callerId) {
    // role: boolean to set user as owner or moderator of a group
    const APIUrl = role === 'owner' ? 'removeOwner' : 'removeModerator';
    const displayRole = i18n.__(`api.rocketChat.${role}`);
    return this._getToken()
      .then((token) =>
        this._getUserByUsername(username).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.${APIUrl}`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.roleUnset', { groupId, username, role: displayRole }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.unsetRoleError', { groupId, username, role: displayRole })} (${
                    response.data.error
                  })`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(
          i18n.__('api.rocketChat.unsetRoleError', { groupId, username, role: displayRole }),
          'error',
          callerId,
        );
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  kickUser(groupId, username, callerId) {
    return this._getToken()
      .then((token) =>
        this._getUserByUsername(username).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.kick`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.userKicked', { groupId, username }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.userKickError', { groupId, username })} (${response.data.error})`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.userKickError', { groupId, username }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  createUser(email, name, username, callerId) {
    return this._getToken()
      .then((token) => {
        return axios
          .post(
            `${this.rcURL}/users.create`,
            {
              email,
              name,
              username,
              // auto-generate a rather long random password.
              // It will not be used to log in, but API requires one.
              password: genRandomPassword(256),
              active: true,
              verified: true,
              sendWelcomeEmail: true,
              requirePasswordChange: false,
              roles: ['user'],
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-User-Id': this.adminId,
                'X-Auth-Token': token,
              },
            },
          )
          .then((response) => {
            if (response.data && response.data.success === true) {
              logServer(i18n.__('api.rocketChat.userAdded', { username }));
              return response.data.user;
            }
            logServer(`${i18n.__('api.rocketChat.userAddError', { username })} (${response.error})`, 'error', callerId);
            return null;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.userAddError', { username }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  ensureUser(userId, callerId) {
    const meteorUser = Meteor.users.findOne(userId);
    const email = meteorUser.emails[0].address;
    return this._getUserByUsername(meteorUser.username).then((user) => {
      if (user === null) {
        return this.createUser(email, `${meteorUser.firstName} ${meteorUser.lastName}`, meteorUser.username, callerId);
      }
      return Promise.resolve(user);
    });
  }

  updateEmail(username, email) {
    return this._getToken()
      .then((token) =>
        this._getUserByUsername(username).then((user) => {
          return axios
            .post(
              `${this.rcURL}/users.update`,
              {
                userId: user._id,
                data: { email, verified: true },
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.updateEmail', { username, email }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.updateEmailError', { username, email })} (${response.data.error})`,
                  'error',
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.updateEmailError', { username, email }), 'error');
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return false;
      });
  }
}

if (Meteor.isServer && rcEnabled) {
  const rcClient = new RocketChatClient();

  Meteor.afterMethod('groups.createGroup', function rcCreateGroup({ name }) {
    const group = Groups.findOne({ name });
    if (group.plugins.rocketChat === true) {
      const { slug } = group;
      rcClient.createGroup(slug, this.userId).then(() => {
        // adds user as channel admin
        rcClient.ensureUser(this.userId, this.userId).then((user) => {
          const { username } = user;
          rcClient
            .inviteUser(slug, username, this.userId)
            .then(() => rcClient.setRole(slug, username, 'owner', this.userId));
        });
      });
    }
  });

  Meteor.beforeMethod('groups.removeGroup', function rcRemoveGroup({ groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.rocketChat === true) {
      rcClient.removeGroup(group.slug, this.userId);
    }
  });

  Meteor.afterMethod('groups.updateGroup', function nextUpdateGroup({ groupId }) {
    // create rocketChat group if needed
    const [newData, oldGroup] = this.result;
    const group = Groups.findOne({ _id: groupId });
    const { slug } = group;
    if (group.plugins.rocketChat === true) {
      // check if group was created previously
      rcClient.getGroup(oldGroup.slug).then((rcGroup) => {
        if (rcGroup !== null) {
          if (newData.name !== oldGroup.name) {
            // modify existing group name
            rcClient.renameGroup(rcGroup, slug, this.userId);
          }
        } else {
          rcClient.getGroup(slug).then((rcNewGroup) => {
            if (rcNewGroup === null) {
              rcClient.createGroup(slug, this.userId).then(() => {
                // adds user as channel admin
                rcClient.ensureUser(this.userId, this.userId).then((user) => {
                  const { username } = user;
                  rcClient
                    .inviteUser(slug, username, this.userId)
                    .then(() => rcClient.setRole(slug, username, 'owner', this.userId));
                });
              });
            }
          });
        }
      });
    }
  });

  Meteor.afterMethod('users.setAdminOf', function rcSetAdminOf({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.rocketChat === true) {
      rcClient.ensureUser(userId, this.userId).then((rcUser) => {
        if (rcUser !== null) {
          const { username } = rcUser;
          rcClient
            .inviteUser(group.slug, username, this.userId)
            .then(() => rcClient.setRole(group.slug, username, 'owner', this.userId));
        }
      });
    }
  });

  Meteor.beforeMethod('users.unsetAdminOf', function rcUnsetAdminOf({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.rocketChat === true) {
      rcClient.ensureUser(userId, this.userId).then((user) => {
        if (user !== null) {
          const { username } = user;
          rcClient.unsetRole(group.slug, username, 'owner', this.userId).then(() => {
            if (!Roles.userIsInRole(userId, ['member', 'animator'], groupId)) {
              rcClient.kickUser(group.slug, username, this.userId);
            }
          });
        }
      });
    }
  });

  Meteor.afterMethod('users.setAnimatorOf', function rcSetAnimatorOf({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.rocketChat === true) {
      rcClient.ensureUser(userId, this.userId).then((rcUser) => {
        if (rcUser != null) {
          const { username } = rcUser;
          rcClient
            .inviteUser(group.slug, username, this.userId)
            .then(() => rcClient.setRole(group.slug, username, 'moderator', this.userId));
        }
      });
    }
  });

  Meteor.beforeMethod('users.unsetAnimatorOf', function rcUnsetAnimatorOf({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.rocketChat === true) {
      rcClient.ensureUser(userId, this.userId).then((user) => {
        if (user !== null) {
          const { username } = user;
          rcClient.unsetRole(group.slug, username, 'moderator', this.userId).then(() => {
            if (!Roles.userIsInRole(userId, ['member', 'admin'], groupId)) {
              rcClient.kickUser(group.slug, username, this.userId);
            }
          });
        }
      });
    }
  });

  Meteor.afterMethod('users.setMemberOf', function rcSetMemberOf({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.rocketChat === true) {
      rcClient.ensureUser(userId, this.userId).then((rcUser) => {
        if (rcUser != null) {
          const { username } = rcUser;
          rcClient.inviteUser(group.slug, username, this.userId);
        }
      });
    }
  });

  Meteor.beforeMethod('users.unsetMemberOf', function rcUnsetMemberOf({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.rocketChat === true) {
      if (!Roles.userIsInRole(userId, ['animator', 'admin'], groupId)) {
        rcClient.ensureUser(userId, this.userId).then((user) => {
          if (user !== null) {
            const { username } = user;
            rcClient.kickUser(group.slug, username, this.userId);
          }
        });
      }
    }
  });

  Meteor.afterMethod('users.userUpdated', function rcUserUpdated(params) {
    const { userId, data } = params;
    if (data.email) {
      rcClient.ensureUser(userId, this.userId).then((rcUser) => {
        if (rcUser != null) {
          const { username } = rcUser;
          rcClient.updateEmail(username, data.email);
        }
      });
    }
    // console.log('RESULT : ', this.result);
    // console.log('ERROR: ', this.error);
  });
}
