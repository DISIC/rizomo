/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { updateUserBookmark, removeUserBookmark, createUserBookmark } from '../methods';
import UserBookmarks from '../userBookmarks';
import './publications';
import Groups from '../../groups/groups';

describe('bookmarks', function () {
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      UserBookmarks.remove({});

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
    let userId2;
    const url = 'Test/test';
    const url2 = 'Test3/test';
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      UserBookmarks.remove({});

      Groups.remove({});

      Roles.createRole('admin');
      Roles.createRole('member');

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

      // Generate 'user'
      userId2 = Accounts.createUser({
        username: 'yo2',
        password: 'toto2',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        ncloud: '',
      });
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
    });
    describe('createBookmark', function () {
      it('does create a new bookmark as active user', function () {
        const urlFind = UserBookmarks.findOne({ url });
        assert.equal(urlFind, undefined);

        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        const urlFind2 = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2.url, urlFinal);
        assert.equal(urlFind2.userId, userId);
        assert.equal(urlFind2.name, 'Test');
        assert.equal(urlFind2.tag, 'Tag');
      });
      it("Doesn't create bookmark if url already exists", function () {
        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        const urlFind2 = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2.url, urlFinal);
        assert.equal(urlFind2.userId, userId);
        assert.equal(urlFind2.name, 'Test');
        assert.equal(urlFind2.tag, 'Tag');
        assert.throws(
          () => {
            createUserBookmark._execute({ userId }, { url: urlFinal, name: 'Test', tag: 'Tag' });
          },
          Meteor.Error,
          /api.bookmarks.createBookmark.URLAlreadyExists/,
        );
      });
    });
    describe('removeBookmark', function () {
      it('does remove URL', function () {
        // Create URL
        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        const urlFind = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.userId, userId);

        // Remove URL
        removeUserBookmark._execute({ userId }, { url: urlFinal });
        const urlFind2 = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2, undefined);
      });
      it('does global admin can remove any bookmark', function () {
        // Create URL
        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        const urlFind = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.userId, userId);

        // Remove URL
        removeUserBookmark._execute({ userId: adminId }, { url: urlFinal });
        const urlFind2 = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2, undefined);
      });
      it('only admin or author can remove URL', function () {
        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            removeUserBookmark._execute({ userId: userId2 }, { url: urlFinal });
          },
          Meteor.Error,
          /api.bookmarks.notPermitted/,
        );
      });
      it("Doesn't remove URL that doesn't exists", function () {
        createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            removeUserBookmark._execute({ userId }, { url: url2 });
          },
          Meteor.Error,
          /api.bookmarks.UnknownURL/,
        );
      });
    });
    describe('updateBookmark', function () {
      it('does update Bookmark as owner', function () {
        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        const urlFind = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.userId, userId);

        const urlFinal2 = updateUserBookmark._execute(
          { userId },
          { id: urlFind._id, url, name: 'TestModif', tag: 'TagModifié' },
        );
        const urlFind2 = UserBookmarks.findOne({ url: urlFinal2 });
        assert.equal(urlFind2.url, urlFinal2);
        assert.equal(urlFind2.name, 'TestModif');
        assert.equal(urlFind2.tag, 'TagModifié');
        assert.equal(urlFind2.userId, userId);
      });
      it('does update Bookmark as global admin', function () {
        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        const urlFind = UserBookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.userId, userId);

        const urlFinal2 = updateUserBookmark._execute(
          { userId: adminId },
          { id: urlFind._id, url, name: 'TestModif', tag: 'TagModifié' },
        );
        const urlFind2 = UserBookmarks.findOne({ url: urlFinal2 });
        assert.equal(urlFind2.url, urlFinal2);
        assert.equal(urlFind2.name, 'TestModif');
        assert.equal(urlFind2.tag, 'TagModifié');
        assert.equal(urlFind2.userId, userId);
      });
      it('only admin or author can update URL', function () {
        const urlFinal = createUserBookmark._execute({ userId }, { url, name: 'Test', tag: 'Tag' });
        const urlFind = UserBookmarks.findOne({ url: urlFinal });

        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            updateUserBookmark._execute(
              { userId: userId2 },
              { id: urlFind._id, url, name: 'TestModif', tag: 'TagModifié' },
            );
          },
          Meteor.Error,
          /api.bookmarks.notPermitted/,
        );
      });
    });
  });
});
