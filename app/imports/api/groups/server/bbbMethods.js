import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../../utils';
import Groups from '../groups';
import BBBClient from '../../appclients/bbbClient';

export const getMeetingURL = new ValidatedMethod({
  name: 'groups.getMeetingURL',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  async run({ groupId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.getMeetingURL.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check group existence and membership
    const group = Groups.findOne(groupId);
    if (group === undefined) {
      throw new Meteor.Error('api.groups.favGroup.unknownService', i18n.__('api.groups.unknownGroup'));
    }
    if (!Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], groupId)) {
      throw new Meteor.Error('api.groups.getMeetingURL.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const promisedResult = await BBBClient.createMeeting(group.slug, this.userId);
    return promisedResult;
  },
});

export const checkMeeting = new ValidatedMethod({
  name: 'groups.checkMeeting',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  async run({ groupId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.getMeetingURL.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check group existence and membership
    const group = Groups.findOne(groupId);
    if (group === undefined) {
      throw new Meteor.Error('api.groups.favGroup.unknownService', i18n.__('api.groups.unknownGroup'));
    }
    if (!Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], groupId)) {
      throw new Meteor.Error('api.groups.getMeetingURL.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const promisedResult = await BBBClient.checkRunning(group._id, group.slug);
    return promisedResult;
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([getMeetingURL, checkMeeting], 'name');
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
