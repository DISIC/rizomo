import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import s3Client from './config';
import { isActive } from '../../utils';

const { minioBucket } = Meteor.settings.public;

export const filesupload = new ValidatedMethod({
  name: 'files.upload',
  validate: new SimpleSchema({
    file: String,
    name: String,
    path: String,
  }).validator(),
  async run({ file, path, name }) {
    const filePath = `${path}${name}`;
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    const buffer = Buffer.from(file, 'base64');
    const result = await s3Client.putObject(minioBucket, filePath, buffer);
    return result;
  },
});

export const removeFile = new ValidatedMethod({
  name: 'files.remove',
  validate: new SimpleSchema({
    path: String,
  }).validator(),
  async run({ path }) {
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    const stream = s3Client.listObjectsV2(minioBucket, path, true, '');
    stream.on('data', (obj) => {
      s3Client.removeObject(minioBucket, obj.name);
    });
    stream.on('error', (error) => {
      console.log(error);
    });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([removeFile, filesupload], 'name');

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
