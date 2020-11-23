import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';

import { isActive, getLabel } from '../utils';
import Tags from './tags';
import Articles from '../articles/articles';

export const createTag = new ValidatedMethod({
  name: 'tags.createTag',
  validate: new SimpleSchema({
    name: { type: String, min: 1, label: getLabel('api.tags.labels.name') },
  }).validator(),

  run({ name }) {
    const authorized = isActive(this.userId); // && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.tags.createTag.notPermitted', i18n.__('api.users.notPermitted'));
    }
    return Tags.insert({
      name,
    });
  },
});

export const removeTag = new ValidatedMethod({
  name: 'tags.removeTag',
  validate: new SimpleSchema({
    tagId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.tags.labels.id') },
  }).validator(),

  run({ tagId }) {
    // check tag existence
    const tag = Tags.findOne(tagId);
    if (tag === undefined) {
      throw new Meteor.Error('api.tags.removeTag.unknownTag', i18n.__('api.tags.unknownTag'));
    }
    // check if current user is active
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.tags.removeTag.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // remove tag from articles
    Articles.update({}, { $pull: { tags: tagId } }, { multi: true });
    return Tags.remove(tagId);
  },
});

export const updateTag = new ValidatedMethod({
  name: 'tags.updateTag',
  validate: new SimpleSchema({
    tagId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.tags.labels.id') },
    data: Object,
    'data.name': { type: String, min: 1, label: getLabel('api.tags.labels.name') },
  }).validator(),

  run({ tagId, data }) {
    // check tag existence
    const tag = Tags.findOne({ _id: tagId });
    if (tag === undefined) {
      throw new Meteor.Error('api.tags.updateTag.unknownTag', i18n.__('api.tags.unknownTag'));
    }
    // check if current user is active
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.tags.updateTag.notPermitted', i18n.__('api.users.notPermitted'));
    }
    return Tags.update({ _id: tagId }, { $set: data });
  },
});

// Get list of all method names on Tags
const LISTS_METHODS = _.pluck([createTag, removeTag, updateTag], 'name');

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
