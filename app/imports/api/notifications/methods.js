import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel } from '../utils';
import Notifications from './notifications';

export function addExpiration(data) {
  const finalData = { ...data };
  function addDays(date, days) {
    const result = new Date(Number(date));
    // for tests : add minutes instead of days
    // result.setTime(date.getTime() + days * 60 * 1000);
    result.setDate(date.getDate() + days);
    return result;
  }
  // check if an expiration delay has been configured
  if (Meteor.settings.public.NotificationsExpireDays) {
    const dataType =
      typeof Meteor.settings.public.NotificationsExpireDays[data.type] !== 'number' ? 'default' : data.type;
    const numDays = Meteor.settings.public.NotificationsExpireDays[dataType];
    if (numDays || numDays === 0) {
      if (typeof numDays !== 'number') {
        console.log(i18n.__('api.notifications.badConfig', { type: dataType }));
      } else if (numDays > 0) {
        // if delay is set to 0 or negative number,
        // no expiration is set (allows to ignore default delay)
        const expireAt = addDays(new Date(), numDays);
        finalData.expireAt = expireAt;
      }
    }
  }
  return finalData;
}

export const createNotification = new ValidatedMethod({
  name: 'notifications.createNotification',
  validate: new SimpleSchema({
    data: Notifications.schema.omit('createdAt'),
  }).validator({ clean: true }),

  run({ data }) {
    const authorized = true; // TODO isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.notifications.createNotification.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Notifications.insert(addExpiration(data));
  },
});

export const removeNotification = new ValidatedMethod({
  name: 'notifications.removeNotification',
  validate: new SimpleSchema({
    notificationId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.notifications.labels.id') },
  }).validator(),

  run({ notificationId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error(
        'api.notifications.removeNotification.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    const notification = Notifications.findOne({ _id: notificationId });
    const authorized = this.userId === notification.userId;
    if (!authorized) {
      throw new Meteor.Error(
        'api.notifications.removeNotification.notPermitted',
        i18n.__('api.notifications.adminArticleNeeded'),
      );
    }
    return Notifications.remove(notificationId);
  },
});

export const removeAllNotification = new ValidatedMethod({
  name: 'notifications.removeAllNotification',
  validate: null,

  run() {
    if (!isActive(this.userId)) {
      throw new Meteor.Error(
        'api.notifications.removeAllNotification.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    return Notifications.remove({ userId: this.userId });
  },
});

export const removeAllNotificationRead = new ValidatedMethod({
  name: 'notifications.removeAllNotificationRead',
  validate: null,

  run() {
    if (!isActive(this.userId)) {
      throw new Meteor.Error(
        'api.notifications.removeAllNotificationRead.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    return Notifications.remove({ userId: this.userId, read: true });
  },
});

export const markNotificationAsRead = new ValidatedMethod({
  name: 'notifications.markNotificationAsRead',
  validate: new SimpleSchema({
    notificationId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.notifications.labels.id') },
  }).validator(),

  run({ notificationId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error(
        'api.notifications.markNotificationAsRead.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    const notification = Notifications.findOne({ _id: notificationId });
    const authorized = this.userId === notification.userId;
    if (!authorized) {
      throw new Meteor.Error(
        'api.notifications.markNotificationAsRead.notPermitted',
        i18n.__('api.notifications.adminArticleNeeded'),
      );
    }
    return Notifications.update({ _id: notificationId }, { $set: { read: true } });
  },
});

export const markAllNotificationAsRead = new ValidatedMethod({
  name: 'notifications.markAllNotificationAsRead',
  validate: null,

  run() {
    if (!isActive(this.userId)) {
      throw new Meteor.Error(
        'api.notifications.markAllNotificationAsRead.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    return Notifications.update({ userId: this.userId }, { $set: { read: true } }, { multi: true });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    createNotification,
    removeAllNotificationRead,
    removeNotification,
    markNotificationAsRead,
    markAllNotificationAsRead,
    removeAllNotification,
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
