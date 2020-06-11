/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import faker from 'faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
// import { Roles } from 'meteor/alanning:roles';
import {
  createNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationAsRead,
  removeAllNotification,
  removeAllNotificationRead,
} from '../methods';
import './publications';
import Notifications from '../notifications';

describe('notifications', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const notification = Factory.create('notification');
      assert.typeOf(notification, 'object');
    });
  });

  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      Notifications.remove({});

      userId = Accounts.createUser({
        username: 'yo',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      Notifications.remove({});
      _.times(3, () => {
        Factory.create('notification', { userId });
      });
      _.times(3, () => {
        Factory.create('notification', Random.id());
      });
    });

    describe('notifications.self', function () {
      it('sends current user notifications', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('notifications.self', (collections) => {
          assert.equal(collections.notifications.length, 3);
          done();
        });
      });
    });
  });

  describe('methods', function () {
    let userId;

    beforeEach(function () {
      Meteor.users.remove({});
      // Generate 'user'
      userId = Accounts.createUser({
        username: 'yo',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      Notifications.remove({});
      _.times(3, () => {
        Factory.create('notification', { userId });
      });
    });

    describe('createNotification', function () {
      it('does create a notification for the current user', function () {
        const newNotif = {
          userId,
          title: 'yoooo',
          content: 'Vous avez un message.',
          type: 'info',
        };
        createNotification._execute({ userId }, { data: newNotif });
        const notif = Notifications.findOne({ title: 'yoooo' });
        assert.typeOf(notif, 'object');
        assert.equal(notif.userId, userId);
        assert.equal(notif.type, 'info');
      });
    });
    describe('removeNotification', function () {
      it('does remove a notification for the current user', function () {
        const notificationId = Factory.create('notification', { userId, title: 'removeMe' })._id;
        const notif = Notifications.findOne({ title: 'removeMe' });
        assert.typeOf(notif, 'object');
        removeNotification._execute({ userId }, { notificationId });
        const notif2 = Notifications.findOne({ title: 'removeMe' });
        assert.equal(notif2, undefined);
      });
    });
    describe('markNotificationAsRead', function () {
      it('does mark a notification as read for the current user', function () {
        const notificationId = Factory.create('notification', { userId, title: 'markMeAsRead' })._id;
        const notif = Notifications.findOne({ title: 'markMeAsRead' });
        assert.typeOf(notif, 'object');
        assert.equal(notif.read, false);
        markNotificationAsRead._execute({ userId }, { notificationId });
        const notif2 = Notifications.findOne({ title: 'markMeAsRead' });
        assert.equal(notif2.read, true);
      });
    });
    describe('markAllNotificationAsRead', function () {
      it('does mark all notifications as read for the current user', function () {
        assert.equal(Notifications.find({ userId, read: false }).count(), 3);
        markAllNotificationAsRead._execute({ userId });
        assert.equal(Notifications.find({ userId, read: false }).count(), 0);
      });
    });
    describe('removeAllNotification', function () {
      it('does remove all notifications for the current user', function () {
        assert.equal(Notifications.find({ userId }).count(), 3);
        removeAllNotification._execute({ userId });
        assert.equal(Notifications.find({ userId }).count(), 0);
      });
    });
    describe('removeAllNotificationRead', function () {
      it('does remove all notifications already read for the current user', function () {
        const newNotif = {
          userId,
          title: 'ede',
          content: 'Vous avez un message.',
          type: 'info',
          read: true,
        };
        createNotification._execute({ userId }, { data: newNotif });
        assert.equal(Notifications.find({ userId }).count(), 4);
        removeAllNotificationRead._execute({ userId });
        assert.equal(Notifications.find({ userId }).count(), 3);
      });
    });
  });
});
