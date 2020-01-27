import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../utils';
import Services from './services';

export const createService = new ValidatedMethod({
  name: 'services.createService',
  validate: new SimpleSchema({
    title: { type: String, min: 1 },
    description: { type: String, min: 1 },
    url: SimpleSchema.RegEx.Url,
    logo: SimpleSchema.RegEx.Url,
    glyphicon: String,
    target: { type: String, optional: true },
  }).validator(),

  run({
    title, description, url, logo, glyphicon, target,
  }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.services.createService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Services.insert({
      title,
      description,
      url,
      logo,
      glyphicon,
      target,
    });
  },
});

export const removeService = new ValidatedMethod({
  name: 'services.removeService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ serviceId }) {
    // check service existence
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.services.removeService.unknownService', i18n.__('api.services.unknownService'));
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.services.removeService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Services.remove(serviceId);
    // remove service from users favorites
    Meteor.users.update({ favServices: { $all: [serviceId] } }, { $pull: { favServices: serviceId } }, { multi: true });
  },
});

export const updateService = new ValidatedMethod({
  name: 'services.updateService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id },
    data: Object,
    'data.title': { type: String, min: 1, optional: true },
    'data.description': { type: String, optional: true },
    'data.url': { type: String, optional: true },
    'data.logo': { type: String, optional: true },
    'data.target': { type: String, optional: true },
  }).validator(),

  run({ serviceId, data }) {
    // check service existence
    const service = Services.findOne({ _id: serviceId });
    if (service === undefined) {
      throw new Meteor.Error('api.services.updateService.unknownGroup', i18n.__('api.services.unknownService'));
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.services.updateService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Services.update({ _id: serviceId }, { $set: data });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createService, removeService, updateService], 'name');

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
