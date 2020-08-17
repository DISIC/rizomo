import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import logServer from '../logging';

function checkFolderActive(response) {
  // checks that 'Group Folder' API is responding
  if (response.data === undefined || response.data.ocs === undefined) {
    logServer(`Nexcloud: ERROR, make sure 'Group Folders' application is active`, 'error');
    return false;
  }
  return true;
}

class NextcloudClient {
  constructor() {
    const ncURL = Meteor.settings.public.nextcloudURL || '';
    const ncUser = (Meteor.settings.nextcloud && Meteor.settings.nextcloud.nextcloudUser) || '';
    const ncPassword = (Meteor.settings.nextcloud && Meteor.settings.nextcloud.nextcloudPassword) || '';
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
        logServer(`Nextcloud: ERROR getting group ${groupName}`, 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
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
          logServer(`Nextcloud: group ${groupName} added`);
        } else {
          logServer(`Nextcloud: ERROR adding group ${groupName} (${infos.statuscode} - ${infos.message})`, 'error');
        }
        return infos.status === 'ok' ? infos.status : infos.message;
      })
      .catch((error) => {
        logServer(`Nextcloud: ERROR adding group ${groupName}`, 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return `Nextcloud: ERROR adding group ${groupName}`;
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
        logServer(`Nextcloud: could not assign group ${groupName} to folder ${folderName}`, 'error');
        return false;
      });
  }

  _addQuotaToFolder(folderId) {
    // get quota (in bytes) from settings, or -3 if not set (unlimited)
    const quota = Meteor.settings.nextcloud.nextcloudQuota || -3;
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
          logServer(`Nextcloud: group folder ${folderName} added`);
          return this._addGroupToFolder(groupName, folderName, response.data.ocs.data.id).then((resp) => {
            if (resp === true) {
              logServer(`Nextcloud: access and permissions set for group folder ${folderName}`);
              return this._addQuotaToFolder(response.data.ocs.data.id).then((respQuota) => {
                if (respQuota) {
                  logServer(`Nextcloud: quota set for group folder ${folderName}`);
                } else {
                  logServer(`Nextcloud: ERROR setting quota on group folder ${folderName}`, 'error');
                }
                return respQuota;
              });
            }
            logServer(`Nextcloud: ERROR settings group permissions for group folder ${folderName}`, 'error');
            return resp;
          });
        }
        logServer(`Nextcloud: ERROR adding group folder ${folderName}`, 'error');
        return false;
      })
      .catch((error) => {
        logServer(`Nextcloud: ERROR adding group folder ${folderName}`, 'error');
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
                    logServer(`Nextcloud: removed group folder ${folder.id} (${folder.mount_point})`);
                    return true;
                  }
                  logServer(`Nextcloud: ERROR deleting group folder ${folder.id} (${infos.message})`, 'error');
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
          logServer(`Nextcloud: group ${groupName} removed`);
        } else {
          logServer(`Nextcloud: Error removing group ${groupName} (${infos.message})`, 'error');
        }
        return infos.status === 'ok';
      })
      .catch((error) => {
        logServer(`Nextcloud: ERROR removing group ${groupName}`, 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return false;
      });
  }
}

const nextEnabled = Meteor.settings.public.enableNextcloud === true;
const nextClient = Meteor.isServer && nextEnabled ? new NextcloudClient() : null;
export default nextClient;
