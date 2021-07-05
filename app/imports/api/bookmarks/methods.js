import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel } from '../utils';
import Bookmarks from './bookmarks';

function _updateBookmarkURL(id, url, name, tag) {
  Bookmarks.update({ _id: id }, { $set: { url, name, tag } });
}

function _createBookmarkUrl(url, name, tag, groupId, author) {
  try {
    Bookmarks.insert({ url, name, tag, groupId, author });
  } catch (error) {
    if (error.code === 11000) {
      throw new Meteor.Error(
        'api.bookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    } else {
      throw error;
    }
  }
}

export const createBookmark = new ValidatedMethod({
  name: 'bookmark.create',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.tag') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator({ clean: true }),

  run({ url, name, groupId, tag }) {
    const isAllowed =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, ['member', 'animator', 'admin'], groupId) ||
        Roles.userIsInRole(this.userId, 'admin'));
    if (!isAllowed) {
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.groupRankNeeded'));
    }

    const bk = Bookmarks.findOne({ url });
    if (bk !== undefined) {
      throw new Meteor.Error(
        'api.bookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    }

    return _createBookmarkUrl(url, name, tag, groupId, this.userId);
  },
});

export const updateBookmark = new ValidatedMethod({
  name: 'bookmark.updateURL',
  validate: new SimpleSchema({
    id: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.id') },
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.tag') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator({ clean: true }),

  run({ id, url, name, groupId, tag }) {
    const bk = Bookmarks.findOne({ _id: id });
    if (bk === undefined) {
      throw new Meteor.Error('api.bookmarks.UnknownURL', i18n.__('api.bookmarks.UnknownURL'));
    }

    const isAllowed =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin', groupId) ||
        Roles.userIsInRole(this.userId, 'admin') ||
        bk.author === this.userId);
    if (!isAllowed) {
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.adminRankNeeded'));
    }

    return _updateBookmarkURL(id, url, name, tag);
  },
});

export const removeBookmark = new ValidatedMethod({
  name: 'bookmark.removeURL',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ url, groupId }) {
    // check group existence
    const bk = Bookmarks.findOne({ url });
    if (bk === undefined) {
      throw new Meteor.Error('api.bookmarks.UnknownURL', i18n.__('api.bookmarks.UnknownURL'));
    }

    const isAllowed =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin', groupId) ||
        Roles.userIsInRole(this.userId, 'admin') ||
        bk.author === this.userId);

    if (!isAllowed) {
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.adminRankNeeded'));
    }

    Bookmarks.remove({ url });

    return null;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck([createBookmark, updateBookmark, removeBookmark], 'name');
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
