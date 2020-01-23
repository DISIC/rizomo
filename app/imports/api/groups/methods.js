import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../utils';
import Groups from './groups';

export const createGroup = new ValidatedMethod({
  name: 'groups.createGroup',
  validate: new SimpleSchema({
    name: { type: String, min: 1 },
    type: { type: SimpleSchema.Integer, min: 0 },
    info: String,
    note: String,
  }).validator(),

  run({
    name, type, note, info,
  }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.createGroup.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    Groups.insert({
      name,
      type,
      note,
      info,
      owner: this.userId,
      active: true,
    });
  },
});

export const removeGroup = new ValidatedMethod({
  name: 'groups.removeGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ groupId }) {
    // check group existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.groups.removeGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    // FIXME : allow only for owner or for all admins ?
    const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    const authorized = isAdmin || this.userId === group.owner;
    if (!authorized) {
      throw new Meteor.Error('api.groups.removeGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // remove all roles set on this group
    Roles.removeScope(groupId);
    Groups.remove(groupId);
  },
});

export const updateGroup = new ValidatedMethod({
  name: 'groups.updateGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
    data: Object,
    'data.name': { type: String, min: 1, optional: true },
    'data.type': { type: SimpleSchema.Integer, min: 0, optional: true },
    'data.info': { type: String, optional: true },
    'data.note': { type: String, optional: true },
    'data.active': { type: Boolean, optional: true },
    'data.groupPadId': { type: String, optional: true },
    'data.digest': { type: String, optional: true },
  }).validator(),

  run({ groupId, data }) {
    // check group existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.groups.updateGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    const authorized = isAdmin || this.userId === group.owner;
    if (!authorized) {
      throw new Meteor.Error('api.groups.updateGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    Groups.update({ _id: groupId }, { $set: data });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createGroup, removeGroup, updateGroup], 'name');

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
