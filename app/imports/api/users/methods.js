import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import { isActive } from '../utils';
import Services from '../services/services';
import Groups from '../groups/groups';
// initialize Meteor.users customizations
import './users';
import { structures } from './structures';

export const setUsername = new ValidatedMethod({
  name: 'users.setUsername',
  validate: new SimpleSchema({
    username: { type: String, min: 1 },
  }).validator(),

  run({ username }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setUsername.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // will throw error if username already taken
    Accounts.setUsername(this.userId, username);
  },
});

export const setStructure = new ValidatedMethod({
  name: 'users.setStructure',
  validate: new SimpleSchema({
    structure: {
      type: String,
      allowedValues: structures,
    },
  }).validator(),

  run({ structure }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setStructure.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // will throw error if username already taken
    Meteor.users.update({ _id: this.userId }, { $set: { structure } });
  },
});

export const setAdmin = new ValidatedMethod({
  name: 'users.setAdmin',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin');
  },
});

export const setActive = new ValidatedMethod({
  name: 'users.setActive',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setActive.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setActive.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Meteor.users.update(userId, { $set: { isActive: true } });
  },
});

export const unsetAdmin = new ValidatedMethod({
  name: 'users.unsetAdmin',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin');
  },
});

export const setAdminOf = new ValidatedMethod({
  name: 'users.setAdminOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId)
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin', groupId);
    // store info in group collection
    if (group.admins.indexOf(userId) === -1) {
      Groups.update(groupId, { $push: { admins: userId } });
    }
  },
});

export const unsetAdminOf = new ValidatedMethod({
  name: 'users.unsetAdminOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId)
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin', groupId);
    // update info in group collection
    if (group.admins.indexOf(userId) !== -1) {
      Groups.update(groupId, { $pull: { admins: userId } });
    }
  },
});

export const setMemberOf = new ValidatedMethod({
  name: 'users.setMemberOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setMemberOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId)
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error('api.users.setMemberOf.notPermitted', i18n.__('api.users.adminGroupNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'member', groupId);
    // remove candidate Role if present
    if (Roles.userIsInRole(userId, 'candidate', groupId)) {
      Roles.removeUsersFromRoles(userId, 'candidate', groupId);
    }
    // store info in group collection
    if (group.members.indexOf(userId) === -1) {
      Groups.update(groupId, {
        $push: { members: userId },
        $pull: { candidates: userId },
      });
    }
  },
});

export const unsetMemberOf = new ValidatedMethod({
  name: 'users.unsetMemberOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId)
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetMemberOf.notPermitted', i18n.__('api.users.adminGroupNeeded'));
    }
    // add role to user collection
    Roles.removeUsersFromRoles(userId, 'member', groupId);
    // update info in group collection
    if (group.members.indexOf(userId) !== -1) {
      Groups.update(groupId, {
        $pull: { members: userId },
      });
    }
  },
});

export const setCandidateOf = new ValidatedMethod({
  name: 'users.setCandidateOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setCandidateOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setCandidateOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // FIXME: allow to set candidate for self and allow members to invite ?
    const authorized = isActive(this.userId)
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error('api.users.setCandidateOf.notPermitted', i18n.__('api.users.adminGroupNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'candidate', groupId);
    // store info in group collection
    if (group.candidates.indexOf(userId) === -1) {
      Groups.update(groupId, {
        $push: { candidates: userId },
      });
    }
  },
});

export const favService = new ValidatedMethod({
  name: 'users.favService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ serviceId }) {
    // check service existence
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.users.favService.unknownService', i18n.__('api.services.unknownService'));
    }
    if (!this.userId) {
      throw new Meteor.Error('api.users.favService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // store service in user favorite services
    if (user.favServices.indexOf(serviceId) === -1) {
      Meteor.users.update(this.userId, {
        $push: { favServices: serviceId },
      });
    }
  },
});

export const unfavService = new ValidatedMethod({
  name: 'users.unfavService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ serviceId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.unfavService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove service from user favorite services
    if (user.favServices.indexOf(serviceId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favServices: serviceId },
      });
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    setUsername,
    setStructure,
    setActive,
    setAdminOf,
    unsetAdminOf,
    setMemberOf,
    unsetMemberOf,
    setCandidateOf,
    favService,
    unfavService,
  ],
  'name',
);

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
