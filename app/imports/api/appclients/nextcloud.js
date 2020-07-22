import axios from 'axios';
import { Meteor } from 'meteor/meteor';

const _checkFolderActive = function (response) {
  // checks that 'Group Folder' API is responding
  if (response.data === undefined || response.data.ocs === undefined) {
    console.log(`Nexcloud: ERROR, make sure 'Group Folders' application is active`);
    return false;
  }
  return true;
};

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
        console.log(`Nextcloud: ERROR getting group ${groupName}`);
        console.log(error.response && error.response.data ? error.response.data : error);
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
          console.log(`Nextcloud: group ${groupName} added`);
        } else {
          console.log(`Nextcloud: ERROR adding group ${groupName} (${infos.statuscode} - ${infos.message})`);
        }
        return infos.status === 'ok' ? infos.status : infos.message;
      })
      .catch((error) => {
        console.log(`Nextcloud: ERROR adding group ${groupName}`);
        console.log(error.response && error.response.data ? error.response.data : error);
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
        console.log(`Nextcloud: could not assign group ${groupName} to folder ${folderName}`);
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
        if (_checkFolderActive(response) && infos.status === 'ok') {
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
        if (_checkFolderActive(response) && infos.status === 'ok') {
          console.log(`Nextcloud: group folder ${folderName} added`);
          return this._addGroupToFolder(groupName, folderName, response.data.ocs.data.id).then((resp) => {
            if (resp === true) {
              console.log(`Nextcloud: access and permissions set for group folder ${folderName}`);
              return this._addQuotaToFolder(response.data.ocs.data.id).then((respQuota) => {
                if (respQuota) {
                  console.log(`Nextcloud: quota set for group folder ${folderName}`);
                } else {
                  console.log(`Nextcloud: ERROR setting quota on group folder ${folderName}`);
                }
                return respQuota;
              });
            }
            console.log(`Nextcloud: ERROR settings group permissions for group folder ${folderName}`);
            return resp;
          });
        }
        console.log(`Nextcloud: ERROR adding group folder ${folderName}`);
        return false;
      })
      .catch((error) => {
        console.log(`Nextcloud: ERROR adding group folder ${folderName}`);
        console.log(error.response && error.response.data ? error.response.data : error);
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
        if (_checkFolderActive(response) && response.data.ocs.meta.status === 'ok') {
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
                    console.log(`Nextcloud: removed group folder ${folder.id} (${folder.mount_point})`);
                    return true;
                  }
                  console.log(`Nextcloud: ERROR deleting group folder ${folder.id} (${infos.message})`);
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
          console.log(`Nextcloud: group ${groupName} removed`);
        } else {
          console.log(`Nextcloud: Error removing group ${groupName} (${infos.message})`);
        }
        return infos.status === 'ok';
      })
      .catch((error) => {
        console.log(`Nextcloud: ERROR removing group ${groupName}`);
        console.log(error.response && error.response.data ? error.response.data : error);
        return false;
      });
  }
}

const nextEnabled = Meteor.settings.public.enableNextcloud === true;
const nextClient = Meteor.isServer && nextEnabled ? new NextcloudClient() : null;
export default nextClient;
