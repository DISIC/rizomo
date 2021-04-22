import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import Minio from 'minio';

import s3Client from './config';
import { isActive } from '../../utils';
import logServer from '../../logging';

const { minioSSL, minioEndPoint, minioBucket, minioPort } = Meteor.settings.public;

const HOST = `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

export const filesupload = new ValidatedMethod({
  name: 'files.upload',
  validate: new SimpleSchema({
    file: String,
    name: String,
    path: String,
  }).validator(),
  async run({ file, path, name }) {
    try {
      const filePath = `${path}/${name}`;
      // check if current user has admin rights
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      const isUserPath = path === `users/${this.userId}`;

      if (!authorized && !isUserPath) {
        throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
      }
      const fileArray = file.split(',');
      const [fileData, fileData2] = fileArray;
      const buffer = Buffer.from(fileData2 || fileData, 'base64');
      const result = await s3Client.putObject(minioBucket, filePath, buffer);
      return result;
    } catch (error) {
      throw new Meteor.Error(error.typeError, error.message);
    }
  },
});

export const removeFilesFolder = new ValidatedMethod({
  name: 'files.removeFolder',
  validate: new SimpleSchema({
    path: String,
  }).validator(),
  async run({ path }) {
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    const results = new Promise((resolve, reject) => {
      const stream = s3Client.listObjectsV2(minioBucket, path, true, '');
      stream.on('data', (obj) => {
        s3Client.removeObject(minioBucket, obj.name);
      });
      stream.on('error', (error) => {
        reject(error);
      });
      stream.on('end', () => {
        resolve();
      });
    });
    return results;
  },
});

export const removeSelectedFiles = new ValidatedMethod({
  name: 'files.selectedRemove',
  validate: new SimpleSchema({
    toRemove: {
      type: Array,
      optional: true,
    },
    'toRemove.$': String,
    toKeep: {
      type: Array,
      optional: true,
    },
    'toKeep.$': String,
    path: String,
  }).validator(),
  async run({ path, toRemove = [], toKeep = [] }) {
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    const isUserPath = path === `users/${this.userId}`;

    if (!authorized && !isUserPath) {
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    if (toRemove.length) {
      const results = new Promise((resolve, reject) => {
        const objectNames = toRemove.map((img) => img.replace(HOST, ''));
        const stream = s3Client.listObjectsV2(minioBucket, `${path}/`, true, '');
        stream.on('data', (obj) => {
          if (objectNames.find((img) => img === obj.name)) {
            s3Client.removeObject(minioBucket, obj.name);
          }
        });
        stream.on('error', (error) => {
          reject(error);
        });
        stream.on('end', () => {
          resolve();
        });
      });
      return results;
    }
    if (toKeep.length) {
      const results = new Promise((resolve, reject) => {
        const objectNames = toKeep.map((img) => img.replace(HOST, ''));
        const stream = s3Client.listObjectsV2(minioBucket, path, true, '');
        stream.on('data', (obj) => {
          if (!objectNames.includes(obj.name)) {
            s3Client.removeObject(minioBucket, obj.name);
          }
        });
        stream.on('error', (error) => {
          reject(error);
        });
        stream.on('end', () => {
          resolve();
        });
      });
      return results;
    }
    return null;
  },
});

export const moveFiles = new ValidatedMethod({
  name: 'files.move',
  validate: new SimpleSchema({
    sourcePath: String,
    destinationPath: String,
    files: Array,
    'files.$': String,
  }).validator(),
  async run({ sourcePath, destinationPath, files }) {
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    const conds = new Minio.CopyConditions();
    files.forEach((file) => {
      const toReplace = `${HOST}${sourcePath}/`;
      const newFile = file.replace(toReplace, '');

      s3Client.copyObject(
        minioBucket,
        `${destinationPath}/${newFile}`,
        `${minioBucket}/${sourcePath}/${newFile}`,
        conds,
        (err) => {
          s3Client.removeObject(minioBucket, `${sourcePath}/${newFile}`);
          if (err) {
            logServer(
              `Error copying ${newFile} from ${minioBucket}/${sourcePath}/${newFile} to ${destinationPath}/${newFile}`,
              'error',
            );
            logServer(err, 'error');
          }
        },
      );
    });
  },
});

export const rename = new ValidatedMethod({
  name: 'files.rename',
  validate: new SimpleSchema({
    path: String,
    oldName: String,
    newName: String,
  }).validator(),
  async run({ path, oldName, newName }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    const isUserPath = path === `users/${this.userId}`;

    if (!authorized && !isUserPath) {
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    const conds = new Minio.CopyConditions();
    s3Client.copyObject(minioBucket, `${path}/${newName}`, `${minioBucket}/${path}/${oldName}`, conds, (err) => {
      s3Client.removeObject(minioBucket, `${path}/${oldName}`);
      if (err) {
        logServer(`Error renaming ${minioBucket}/${path}/${oldName} to ${path}/${newName}`, 'error');
        logServer(err, 'error');
      }
    });
  },
});

export const getFilesForCurrentUser = new ValidatedMethod({
  name: 'files.user',
  validate: null,
  async run() {
    const authorized = isActive(this.userId);
    if (!authorized) {
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    try {
      const results = new Promise((resolve, reject) => {
        const stream = s3Client.listObjects(minioBucket, `users/${this.userId}`, true, '');
        const files = [];
        stream.on('data', (obj) => {
          files.push(obj);
        });
        stream.on('error', (err) => {
          reject(err);
        });

        stream.on('end', () => {
          resolve(files);
        });
      });
      return results;
    } catch (error) {
      throw new Meteor.Error(error.typeError, error.message);
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [removeFilesFolder, filesupload, removeSelectedFiles, moveFiles, rename, getFilesForCurrentUser],
  'name',
);

// Only allow 5 list operations per connection per second
DDPRateLimiter.addRule(
  {
    name(name) {
      return _.contains(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    },
  },
  5,
  1000,
);
