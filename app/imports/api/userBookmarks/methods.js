import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel } from '../utils';
import UserBookmarks from './userBookmarks';
import { addUserBookmark, removeElement } from '../personalspaces/methods';

function _formatURL(name) {
  let finalName = name;

  if (!name.includes('://')) {
    finalName = `https://${name}`;
  }
  return finalName;
}

export const createUserBookmark = new ValidatedMethod({
  name: 'userBookmark.create',
  validate: UserBookmarks.schema.omit('userId', 'icon').validator({ clean: true }),
  run({ url, name, tag }) {
    const isAllowed = isActive(this.userId);
    if (!isAllowed) {
      throw new Meteor.Error('api.userBookmarks.createUserBookmark.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const finalUrl = _formatURL(url);

    // check that this URL does not already exist in this user bookmarks
    const bk = UserBookmarks.findOne({ url: finalUrl, userId: this.userId });
    if (bk !== undefined) {
      throw new Meteor.Error(
        'api.userBookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    }

    UserBookmarks.insert({ url: finalUrl, name, tag, userId: this.userId });
    return finalUrl;
  },
});

export const updateUserBookmark = new ValidatedMethod({
  name: 'userBookmark.updateURL',
  validate: new SimpleSchema({
    id: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, label: getLabel('api.bookmarks.labels.tag'), defaultValue: '' },
  }).validator({ clean: true }),

  run({ id, url, name, tag }) {
    const bk = UserBookmarks.findOne({ _id: id });
    if (bk === undefined) {
      throw new Meteor.Error(
        'api.UserBookmarks.updateUserBookmark.unknownBookmark',
        i18n.__('api.bookmarks.unknownBookmark'),
      );
    }

    const isAllowed = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || bk.userId === this.userId);
    if (!isAllowed) {
      throw new Meteor.Error('api.userBookmarks.updateUserBookmark.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const finalUrl = _formatURL(url);
    UserBookmarks.update({ _id: id }, { $set: { url: finalUrl, name, tag } });
    return finalUrl;
  },
});

export const favUserBookmark = new ValidatedMethod({
  name: 'userBookmarks.favUserBookmark',
  validate: new SimpleSchema({
    bookmarkId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ bookmarkId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.userBookmarks.favUserBookmark.mustBeLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check bookmark existence
    const bookmark = UserBookmarks.findOne({ _id: bookmarkId, userId: this.userId });
    if (bookmark === undefined) {
      throw new Meteor.Error(
        'api.userBookmarks.favUserBookmark.unknownBookmark',
        i18n.__('api.bookmarks.unknownBookmark'),
      );
    }
    Meteor.users.update(this.userId, {
      $push: { favUserBookmarks: bookmarkId },
    });
    // update user personalSpace
    addUserBookmark._execute({ userId: this.userId }, { bookmarkId });
  },
});

export const unfavUserBookmark = new ValidatedMethod({
  name: 'userBookmarks.unfavUserBookmark',
  validate: new SimpleSchema({
    bookmarkId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ bookmarkId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.userBookmarks.unfavUserBookmark.mustBeLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove bookmark from user favorite bookmarks
    if (user.favUserBookmarks.indexOf(bookmarkId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favUserBookmarks: bookmarkId },
      });
    }
    // update user personalSpace
    removeElement._execute({ userId: this.userId }, { type: 'link', elementId: bookmarkId });
  },
});

export const removeUserBookmark = new ValidatedMethod({
  name: 'userBookmark.removeURL',
  validate: new SimpleSchema({
    id: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ id }) {
    // check bookmark existence
    const bk = UserBookmarks.findOne(id);
    if (bk === undefined) {
      throw new Meteor.Error(
        'api.userBookmarks.removeUserBookmark.UnknownBookmark',
        i18n.__('api.bookmarks.UnknownBookmark'),
      );
    }

    const isAllowed = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || bk.userId === this.userId);

    if (!isAllowed) {
      throw new Meteor.Error('api.userBookmarks.removeUserBookmark.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // remove bookmark from users favorites
    Meteor.users.update({ favUserBookmarks: { $all: [id] } }, { $pull: { favUserBookmarks: id } }, { multi: true });

    unfavUserBookmark._execute({ userId: this.userId }, { bookmarkId: id });

    UserBookmarks.remove(id);

    return null;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck(
    [createUserBookmark, updateUserBookmark, removeUserBookmark, favUserBookmark, unfavUserBookmark],
    'name',
  );
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
