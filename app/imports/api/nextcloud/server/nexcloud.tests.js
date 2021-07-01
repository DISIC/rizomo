/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { updateNextcloudURL, removeNextcloudURL, getRandomNCloudURL } from '../methods';
import Nextcloud from '../nextcloud';
import './publications';

describe('nextcloud', function () {
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      Nextcloud.remove({});

      userId = Accounts.createUser({
        username: 'yo',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        ncloud: '',
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    const url = 'Test/test';
    const url2 = 'Test2/test';
    const url3 = 'Test3/test';
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      Nextcloud.remove({});

      // Generate admin
      const emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });
      Roles.addUsersToRoles(adminId, 'admin');

      // Generate 'user'
      userId = Accounts.createUser({
        username: 'yo',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        ncloud: '',
      });
      Meteor.users.update({}, { $set: { isActive: true } });
    });
    describe('createNextcloudUrl', function () {
      it("does create a new URL if doesn't exists", function () {
        const urlFind = Nextcloud.findOne({ url });
        assert.equal(urlFind, undefined);

        // Create URL
        updateNextcloudURL._execute({ userId: adminId }, { url, active: true });
        const urlFind2 = Nextcloud.findOne({ url });
        assert.equal(urlFind2.url, url);
        assert.equal(urlFind2.active, true);
      });
      it('does update URL if already exists', function () {
        // Create URL
        updateNextcloudURL._execute({ userId: adminId }, { url, active: true });
        const urlFind = Nextcloud.findOne({ url });
        assert.equal(urlFind.url, url);
        assert.equal(urlFind.active, true);

        // Deactivate url and update it
        updateNextcloudURL._execute({ userId: adminId }, { url, active: false });
        const urlFind2 = Nextcloud.findOne({ url });
        assert.equal(urlFind2.url, url);
        assert.equal(urlFind2.active, false);
      });
      it('only global admin can create/update URL', function () {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            updateNextcloudURL._execute({ userId }, { url, active: true });
          },
          Meteor.Error,
          /api.nextcloud.updateNextcloudURL.notPermitted/,
        );
      });
    });
    describe('removeNextcloudURL', function () {
      it('does remove URL', function () {
        // Create URL
        updateNextcloudURL._execute({ userId: adminId }, { url, active: true });
        const urlFind = Nextcloud.findOne({ url });
        assert.equal(urlFind.url, url);
        assert.equal(urlFind.active, true);

        // Remove URL
        removeNextcloudURL._execute({ userId: adminId }, { url });
        const urlFind2 = Nextcloud.findOne({ url });
        assert.equal(urlFind2, undefined);
      });
      it('only global admin can remove URL', function () {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            updateNextcloudURL._execute({ userId: adminId }, { url, active: true });
            removeNextcloudURL._execute({ userId }, { url });
          },
          Meteor.Error,
          /api.nextcloud.removeNextcloudURL.notPermitted/,
        );
      });
    });
    describe('setNCloudURL', function () {
      it('does count number of uses', function () {
        updateNextcloudURL._execute({ userId: adminId }, { url: url3, active: true });
        const urlFind = Nextcloud.findOne({ url: url3 });
        assert.equal(urlFind.url, url3);
        assert.equal(urlFind.active, true);
        assert.equal(urlFind.count, 0);

        const user = Meteor.users.find({ userId });
        user.ncloud = getRandomNCloudURL();

        const urlFind2 = Nextcloud.findOne({ url: user.ncloud });
        assert.equal(user.ncloud, url3);
        assert.equal(urlFind2.count, 1);
      });
      it('does select only active url', function () {
        Nextcloud.remove({});
        const user = Meteor.users.find({ userId });
        user.ncloud = '';
        Meteor.users.update({ userId }, { $set: { ncloud: '' } });

        updateNextcloudURL._execute({ userId: adminId }, { url, active: false });
        const urlFind = Nextcloud.findOne({ url });
        assert.equal(urlFind.url, url);
        assert.equal(urlFind.active, false);
        assert.equal(urlFind.count, 0);

        updateNextcloudURL._execute({ userId: adminId }, { url: url2, active: true });
        const urlFind2 = Nextcloud.findOne({ url: url2 });
        assert.equal(urlFind2.url, url2);
        assert.equal(urlFind2.active, true);
        assert.equal(urlFind2.count, 0);

        // Select url for user
        user.ncloud = getRandomNCloudURL();

        const urlUser = Nextcloud.findOne({ url: user.ncloud });
        assert.equal(user.ncloud, url2);
        assert.equal(urlUser.count, 1);
      });
    });
  });
});
