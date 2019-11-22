import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import Groups from '../groups/groups';
// initialize Meteor.users customizations
import './users';

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
    const authorized = this.userId && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin');
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
    const authorized = this.userId && Roles.userIsInRole(this.userId, 'admin');
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
      throw new Meteor.Error(
        'api.users.setAdminOf.unknownGroup',
        i18n.__('api.groups.unknownGroup'),
      );
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = this.userId
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error(
        'api.users.setAdminOf.notPermitted',
        i18n.__('api.groups.adminGroupNeeded'),
      );
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
      throw new Meteor.Error(
        'api.users.unsetAdminOf.unknownGroup',
        i18n.__('api.groups.unknownGroup'),
      );
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error(
        'api.users.unsetAdminOf.unknownUser',
        i18n.__('api.users.unknownUser'),
      );
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = this.userId
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error(
        'api.users.unsetAdminOf.notPermitted',
        i18n.__('api.groups.adminGroupNeeded'),
      );
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
      throw new Meteor.Error(
        'api.users.setMemberOf.unknownGroup',
        i18n.__('api.groups.unknownGroup'),
      );
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = this.userId
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error(
        'api.users.setMemberOf.notPermitted',
        i18n.__('api.users.adminGroupNeeded'),
      );
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
      throw new Meteor.Error(
        'api.users.unsetMemberOf.unknownGroup',
        i18n.__('api.groups.unknownGroup'),
      );
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error(
        'api.users.unsetMemberOf.unknownUser',
        i18n.__('api.users.unknownUser'),
      );
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = this.userId
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error(
        'api.users.unsetMemberOf.notPermitted',
        i18n.__('api.users.adminGroupNeeded'),
      );
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
      throw new Meteor.Error(
        'api.users.setCandidateOf.unknownGroup',
        i18n.__('api.groups.unknownGroup'),
      );
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error(
        'api.users.setCandidateOf.unknownUser',
        i18n.__('api.users.unknownUser'),
      );
    }
    // FIXME: allow to set candidate for self and allow members to invite ?
    const authorized = this.userId
      && (Roles.userIsInRole(this.userId, 'admin', groupId) || this.userId === group.owner);
    if (!authorized) {
      throw new Meteor.Error(
        'api.users.setCandidateOf.notPermitted',
        i18n.__('api.users.adminGroupNeeded'),
      );
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

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [setAdminOf, unsetAdminOf, setMemberOf, unsetMemberOf, setCandidateOf],
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
