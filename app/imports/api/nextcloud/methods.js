import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel } from '../utils';
import Nextcloud from './nextcloud';

function _updateNextcloudURL(url, active, count) {
  Nextcloud.update({ url }, { $set: { active, count } });
}

function _createUrl(url, active) {
  try {
    Nextcloud.insert({ url, active });
  } catch (error) {
    if (error.code === 11000) {
      throw new Meteor.Error('api.nextcloud._createUrl.urlAlreadyExists', i18n.__('api.nextcloud.urlAlreadyExists'));
    } else {
      throw error;
    }
  }
}

export function getRandomNCloudURL() {
  const element = Nextcloud.findOne({ active: true }, { sort: { count: 1 } });

  if (element !== undefined) {
    element.count += 1;
    _updateNextcloudURL(element.url, element.active, element.count);
    return element.url;
  }
  return '';
}

export const updateNextcloudURL = new ValidatedMethod({
  name: 'nextcloud.updateURL',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.nextcloud.labels.url') },
    active: { type: Boolean, optional: true, label: getLabel('api.nextcloud.labels.active') },
  }).validator({ clean: true }),

  run({ url, active }) {
    const isAllowed = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!isAllowed) {
      throw new Meteor.Error('api.nextcloud.updateNextcloudURL.notPermitted', i18n.__('api.nextcloud.adminRankNeeded'));
    }

    const ncloud = Nextcloud.findOne({ url });
    if (ncloud === undefined) {
      return _createUrl(url, active);
    }

    return _updateNextcloudURL(url, active, ncloud.count);
  },
});

export const removeNextcloudURL = new ValidatedMethod({
  name: 'nextcloud.removeURL',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.nextcloud.labels.url') },
  }).validator(),

  run({ url }) {
    // check group existence
    const ncloud = Nextcloud.findOne({ url });
    if (ncloud === undefined) {
      throw new Meteor.Error('api.nextcloud.removeNextcloudURL.unknownURL', i18n.__('api.nextcloud.unknownURL'));
    }
    // check if current user has admin rights
    if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error(
        'api.nextcloud.removeNextcloudURL.notPermitted',
        i18n.__('api.nextcloud.adminGroupNeeded'),
      );
    }

    Nextcloud.remove({ url });

    return null;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck([updateNextcloudURL, removeNextcloudURL], 'name');
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
}
