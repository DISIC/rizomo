import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../utils';
import AppSettings from './appsettings';

export const updateAppsettings = new ValidatedMethod({
  name: 'appSettings.updateAppsettings',
  validate: new SimpleSchema({
    external: {
      type: Boolean,
      label: getLabel('api.appsettings.labels.external'),
      optional: true,
    },
    link: {
      type: String,
      label: getLabel('api.appsettings.labels.link'),
      optional: true,
    },
    content: {
      type: String,
      label: getLabel('api.appsettings.labels.content'),
      optional: true,
    },
    key: {
      type: String,
    },
  }).validator({ clean: true }),

  run({ external, link, content, key }) {
    try {
      // check if current user is admin
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error('api.appsettings.updateAppsettings.notPermitted', i18n.__('api.users.adminNeeded'));
      }
      const args = { content, external, link };
      return AppSettings.update({ _id: 'settings' }, { $set: { [key]: args } });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const updateIntroductionLanguage = new ValidatedMethod({
  name: 'appSettings.updateIntroductionLanguage',
  validate: new SimpleSchema({
    language: {
      type: String,
      label: getLabel('api.appsettings.labels.external'),
      optional: true,
    },
    content: {
      type: String,
      label: getLabel('api.appsettings.labels.content'),
      optional: true,
    },
  }).validator({ clean: true }),

  run({ language, content }) {
    try {
      // check if current user is admin
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.updateIntroductionLanguage.notPermitted',
          i18n.__('api.users.adminNeeded'),
        );
      }
      const appsettings = AppSettings.findOne({});
      const { introduction } = appsettings;
      const langIndex = introduction.findIndex((entry) => entry.language === language);
      const newIntro = [...introduction];
      if (langIndex > -1) {
        newIntro[langIndex].content = content;
      } else {
        newIntro.push({ language, content });
      }
      return AppSettings.update({ _id: 'settings' }, { $set: { introduction: newIntro } });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const getAppSettingsLinks = new ValidatedMethod({
  name: 'appSettings.getAppSettingsLinks',
  validate: null,
  run() {
    try {
      return AppSettings.findOne({ _id: 'settings' }, { fields: AppSettings.links });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([updateAppsettings, updateIntroductionLanguage, getAppSettingsLinks], 'name');

if (Meteor.isServer) {
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
