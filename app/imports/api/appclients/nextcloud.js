import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import logServer from '../logging';
import Groups from '../groups/groups';

const nextcloudPlugin = Meteor.settings.public.groupPlugins.nextcloud;
const { nextcloud } = Meteor.settings

function checkFolderActive(response) {
  // checks that 'Group Folder' API is responding
  if (response.data === undefined || response.data.ocs === undefined) {
    logServer(i18n.__('api.nextcloud.groupFoldersInactive'), 'error');
    return false;
  }
  return true;
}

class NextcloudClient {
  constructor() {
    const ncURL = nextcloudPlugin && nextcloudPlugin.URL || '';
    const ncUser = (nextcloud && nextcloud.nextcloudUser) || '';
    const ncPassword = (nextcloud && nextcloud.nextcloudPassword) || '';
    this.nextURL = `${ncURL}/ocs/v1.php/cloud`;
    this.appsURL = `${ncURL}/apps`;
    this.basicAuth = Buffer.from(`${ncUser}:${ncPassword}`, 'binary').toString('base64');
  }

  groupExists(groupName) {
    return axios
      .get(`${this.nextURL}/groups`, {
        params: {
          search: groupName,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        return response.data.ocs.data.groups.includes(groupName);
      })
      .catch((error) => {
        logServer(i18n.__('api.nextcloud.groupNotFound', { groupName }), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return false;
      });
  }

  checkConfig() {
    logServer(i18n.__('api.nextcloud.checkConfig', { URL: this.nextURL }));
    return axios
      .get(`${this.appsURL}/groupfolders/folders`, {
        params: { format: 'json' },
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        if (checkFolderActive(response) === true) {
          logServer(i18n.__('api.nextcloud.configOk'));
          return true;
        }
        return false;
      })
      .catch((error) => {
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(i18n.__('api.nextcloud.badConfig'), 'error');
        return false;
      });
  }

  addGroup(groupName) {
    return axios
      .post(
        `${this.nextURL}/groups`,
        {
          groupid: groupName,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status === 'ok') {
          logServer(i18n.__('api.nextcloud.groupAdded', { groupName }));
        } else {
          logServer(
            `${i18n.__('api.nextcloud.groupAddError', { groupName })} (${infos.statuscode} - ${infos.message})`,
            'error',
          );
        }
        return infos.status === 'ok' ? infos.status : infos.message;
      })
      .catch((error) => {
        logServer(i18n.__('api.nextcloud.groupAddError', { groupName }), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return i18n.__('api.nextcloud.groupAddError', { groupName });
      });
  }

  _addGroupToFolder(groupName, folderName, folderId) {
    return axios
      .post(
        `${this.appsURL}/groupfolders/folders/${folderId}/groups`,
        {
          group: groupName,
        },
        {
          params: { format: 'json' },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        if (response.data.ocs.meta.status === 'ok') {
          return axios
            .post(
              `${this.appsURL}/groupfolders/folders/${folderId}/groups/${groupName}`,
              {
                // set permissions to : create, read, update, delete (not share)
                permissions: 15,
              },
              {
                params: { format: 'json' },
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Basic ${this.basicAuth}`,
                  'OCS-APIRequest': true,
                },
              },
            )
            .then((resp) => resp.data.ocs.meta.status === 'ok');
        }
        logServer(i18n.__('api.nextcloud.groupFolderAssignError', { groupName, folderName }), 'error');
        return false;
      });
  }

  _addQuotaToFolder(folderId) {
    // get quota (in bytes) from settings, or -3 if not set (unlimited)
    const quota = nextcloud.nextcloudQuota || -3;
    return axios
      .post(
        `${this.appsURL}/groupfolders/folders/${folderId}/quota`,
        {
          quota,
        },
        {
          params: { format: 'json' },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (checkFolderActive(response) && infos.status === 'ok') {
          return true;
        }
        return false;
      });
  }

  addGroupFolder(groupName, folderName) {
    // creates a new group folder and configure access for group users
    return axios
      .post(
        `${this.appsURL}/groupfolders/folders`,
        {
          mountpoint: folderName,
        },
        {
          params: { format: 'json' },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (checkFolderActive(response) && infos.status === 'ok') {
          logServer(i18n.__('api.nextcloud.groupFolderAdded', { folderName }));
          return this._addGroupToFolder(groupName, folderName, response.data.ocs.data.id).then((resp) => {
            if (resp === true) {
              logServer(i18n.__('api.nextcloud.permissionsSet', { folderName }));
              return this._addQuotaToFolder(response.data.ocs.data.id).then((respQuota) => {
                if (respQuota) {
                  logServer(i18n.__('api.nextcloud.quotaSet', { folderName }));
                } else {
                  logServer(i18n.__('api.nextcloud.quotaSetError', { folderName }), 'error');
                }
                return respQuota;
              });
            }
            logServer(i18n.__('api.nextcloud.permissionSetError', { folderName }), 'error');
            return resp;
          });
        }
        logServer(i18n.__('api.nextcloud.folderAddError', { folderName }), 'error');
        return false;
      })
      .catch((error) => {
        logServer(i18n.__('api.nextcloud.folderAddError', { folderName }), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return false;
      });
  }

  removeGroupFolder(groupName) {
    return axios
      .get(`${this.appsURL}/groupfolders/folders`, {
        params: { format: 'json' },
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        if (checkFolderActive(response) && response.data.ocs.meta.status === 'ok') {
          // find groupFolder ID for groupName
          const folders = Object.values(response.data.ocs.data).filter((entry) => {
            return entry.mount_point === groupName && Object.keys(entry.groups).includes(groupName);
          });
          return Promise.all(
            folders.map((folder) => {
              // check that folder is linked to group
              return axios
                .delete(`${this.appsURL}/groupfolders/folders/${folder.id}`, {
                  params: { format: 'json' },
                  headers: {
                    Accept: 'application/json',
                    Authorization: `Basic ${this.basicAuth}`,
                    'OCS-APIRequest': true,
                  },
                })
                .then((resp) => {
                  const infos = resp.data.ocs.meta;
                  if (infos.status === 'ok') {
                    logServer(
                      i18n.__('api.nextcloud.folderRemoved', { id: folder.id, mount_point: folder.mount_point }),
                    );
                    return true;
                  }
                  logServer(
                    i18n.__('api.nextcloud.folderRemoveError', { id: folder.id, message: infos.message }),
                    'error',
                  );
                  return false;
                });
            }),
          ).then((responses) => !responses.includes(false));
        }
        return false;
      });
  }

  removeGroup(groupName) {
    return axios
      .delete(`${this.nextURL}/groups/${groupName}`, {
        headers: {
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status === 'ok') {
          logServer(i18n.__('api.nextcloud.groupRemoved', { groupName }));
        } else {
          logServer(`${i18n.__('api.nextcloud.groupRemoveError', { groupName })} (${infos.message})`, 'error');
        }
        return infos.status === 'ok';
      })
      .catch((error) => {
        logServer(i18n.__('api.nextcloud.groupRemoveError', { groupName }), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return false;
      });
  }
}

if (Meteor.isServer && nextcloudPlugin && nextcloudPlugin.enable) {
  const nextClient = new NextcloudClient();
  // check that api is accessible and groupFolders plugin is active
  nextClient.checkConfig();

  Meteor.afterMethod('groups.createGroup', function nextCreateGroup({ name, plugins }) {
    if (plugins.nextcloud === true) {
      // create associated group in Nextcloud
      nextClient.addGroup(name).then((response) => {
        if (response === 'ok') {
          nextClient.addGroupFolder(name, name).then((res) => {
            if (res === false) logServer(i18n.__('api.nextcloud.addGroupFolderError'), 'error', this.userId);
          });
        } else {
          const msg =
            response === 'group exists' ? i18n.__('api.nextcloud.groupExists') : i18n.__('api.nextcloud.addGroupError');
          logServer(i18n.__(msg), 'error', this.userId);
        }
      });
    }
  });

  Meteor.beforeMethod('groups.removeGroup', function nextRemoveGroup({ groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (group.plugins.nextcloud === true) {
      // remove group from nextcloud if it exists
      nextClient.groupExists(group.name).then((resExists) => {
        if (resExists) {
          nextClient.removeGroupFolder(group.name).then((response) => {
            if (response)
              nextClient.removeGroup(group.name).then((res) => {
                if (res === false) logServer(i18n.__('api.nextcloud.removeGroupError'), 'error', this.userId);
              });
            else logServer(i18n.__('api.nextcloud.removeGroupFolderError'), 'error', this.userId);
          });
        }
      });
    }
  });

  Meteor.afterMethod('groups.updateGroup', function nextUpdateGroup({ groupId }) {
    // create nextcloud group if needed
    const group = Groups.findOne({ _id: groupId });
    const groupName = group.name;
    if (group.plugins.nextcloud === true) {
      nextClient.groupExists(groupName).then((resExists) => {
        if (resExists === false) {
          nextClient.addGroup(groupName).then((response) => {
            if (response === 'ok') {
              nextClient.addGroupFolder(groupName, groupName).then((res) => {
                if (res === false) logServer(i18n.__('api.nextcloud.addGroupFolderError'), 'error', this.userId);
              });
            } else {
              const msg =
                response === 'group exists'
                  ? i18n.__('api.nextcloud.groupExists')
                  : i18n.__('api.nextcloud.addGroupError');
              logServer(msg, 'error', this.userId);
            }
          });
        }
      });
    }
  });
}
