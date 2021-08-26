import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel } from '../utils';
import UserBookmarks from './userBookmarks';

function _updateBookmarkURL(id, url, name, tag) {
  UserBookmarks.update({ _id: id }, { $set: { url, name, tag } });
  // Meteor.call('bookmark.getFavicon', { url });
}

function _formatURL(name) {
  let finalName = name;

  if (!name.includes('://')) {
    finalName = `https://${name}`;
  }
  return finalName;
}

function _createBookmarkUrl(url, name, tag, userId) {
  try {
    UserBookmarks.insert({ url, name, tag, userId });
    // Meteor.call('bookmark.getFavicon', { url });
  } catch (error) {
    if (error.code === 11000) {
      throw new Meteor.Error(
        'api.userBookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.userBookmarks.createBookmark.URLAlreadyExists'),
      );
    } else {
      throw error;
    }
  }
}

export const createUserBookmark = new ValidatedMethod({
  name: 'userBookmark.create',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.tag') },
  }).validator({ clean: true }),

  run({ url, name, tag }) {
    const isAllowed = isActive(this.userId);
    if (!isAllowed) {
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.groupRankNeeded'));
    }

    const finalUrl = _formatURL(url);

    const bk = UserBookmarks.findOne({ url: finalUrl });
    if (bk !== undefined) {
      throw new Meteor.Error(
        'api.bookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    }

    _createBookmarkUrl(finalUrl, name, tag, this.userId);
    return finalUrl;
  },
});

export const updateUserBookmark = new ValidatedMethod({
  name: 'userBookmark.updateURL',
  validate: new SimpleSchema({
    id: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.id') },
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.tag') },
  }).validator({ clean: true }),

  run({ id, url, name, tag }) {
    const bk = UserBookmarks.findOne({ _id: id });
    if (bk === undefined) {
      throw new Meteor.Error('api.bookmarks.UnknownURL', i18n.__('api.bookmarks.UnknownURL'));
    }

    const isAllowed = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || bk.userId === this.userId);
    if (!isAllowed) {
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.adminRankNeeded'));
    }

    const finalUrl = _formatURL(url);

    _updateBookmarkURL(id, finalUrl, name, tag);
    return finalUrl;
  },
});

export const removeUserBookmark = new ValidatedMethod({
  name: 'userBookmark.removeURL',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
  }).validator(),

  run({ url }) {
    // check bookmark existence
    const bk = UserBookmarks.findOne({ url });
    if (bk === undefined) {
      throw new Meteor.Error('api.bookmarks.UnknownURL', i18n.__('api.bookmarks.UnknownURL'));
    }

    const isAllowed = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || bk.userId === this.userId);

    if (!isAllowed) {
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.adminRankNeeded'));
    }

    UserBookmarks.remove({ url });

    return null;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck([createUserBookmark, updateUserBookmark, removeUserBookmark], 'name');
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
