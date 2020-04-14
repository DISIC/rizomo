import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../utils';
import Services from './services';
import { addService, removeElement } from '../personalspaces/methods';

export const createService = new ValidatedMethod({
  name: 'services.createService',
  validate: Services.schema.omit('slug').validator(),

  run(args) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.services.createService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    const serviceId = Services.insert(args);
    Services.update(serviceId, {
      $set: {
        logo: args.logo.replace('/undefined/', `/${serviceId}/`),
        screenshots: args.screenshots.map((screen) => screen.replace('/undefined/', `/${serviceId}/`)),
      },
    });

    if (Meteor.isServer && !Meteor.isTest) {
      const files = [args.logo, ...args.screenshots];
      try {
        Meteor.call('files.move', {
          sourcePath: 'services/undefined/',
          destinationPath: `services/${serviceId}/`,
          files,
        });
      } catch (error) {
        throw new Meteor.Error('api.services.createService.moveError', error.message);
      }
    }
  },
});

export const removeService = new ValidatedMethod({
  name: 'services.removeService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
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
    if (Meteor.isServer && !Meteor.isTest) {
      Meteor.call('files.removeFolder', { path: `services/${service._id}` });
    }
  },
});

export const updateService = new ValidatedMethod({
  name: 'services.updateService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
    data: Services.schema.omit('slug'),
  }).validator(),

  run({ data, serviceId }) {
    // check service existence
    const currentService = Services.findOne({ _id: serviceId });
    if (currentService === undefined) {
      throw new Meteor.Error('api.services.updateService.unknownGroup', i18n.__('api.services.unknownService'));
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.services.updateService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Services.update({ _id: serviceId }, { $set: data });

    if (Meteor.isServer && !Meteor.isTest) {
      const files = [data.logo, ...data.screenshots];
      Meteor.call('files.selectedRemove', {
        path: `services/${serviceId}/`,
        toKeep: files,
      });
    }
  },
});

export const favService = new ValidatedMethod({
  name: 'services.favService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run({ serviceId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.services.favService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check service existence
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.services.favService.unknownService', i18n.__('api.services.unknownService'));
    }
    const user = Meteor.users.findOne(this.userId);
    // store service in user favorite services
    if (user.favServices.indexOf(serviceId) === -1) {
      Meteor.users.update(this.userId, {
        $push: { favServices: serviceId },
      });
    }
    // update user personalSpace
    addService._execute({ userId: this.userId }, { serviceId });
  },
});

export const unfavService = new ValidatedMethod({
  name: 'services.unfavService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run({ serviceId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.services.unfavService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove service from user favorite services
    if (user.favServices.indexOf(serviceId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favServices: serviceId },
      });
    }
    // update user personalSpace
    removeElement._execute({ userId: this.userId }, { type: 'service', elementId: serviceId });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createService, removeService, updateService, favService, unfavService], 'name');

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
