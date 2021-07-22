/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { Factory } from 'meteor/dburles:factory';
import { Meteor } from 'meteor/meteor';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { updateBookmark, removeBookmark, createBookmark } from '../methods';
import Bookmarks from '../bookmarks';
import './publications';
import Groups from '../../groups/groups';
import { setAdminOf, setMemberOf } from '../../users/server/methods';

describe('bookmarks', function () {
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      Bookmarks.remove({});

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
    let adminGroupId;
    let userGroupId;
    let groupId;
    const url = 'Test/test';
    const url2 = 'Test3/test';
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      Bookmarks.remove({});

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

      // Generate group admin
      const emailGroupAdmin = faker.internet.email();
      adminGroupId = Accounts.createUser({
        email: emailGroupAdmin,
        username: emailGroupAdmin,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });

      // Generate Group member
      const userGroupEmail = faker.internet.email();
      userGroupId = Accounts.createUser({
        email: userGroupEmail,
        username: userGroupEmail,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });

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
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });

      groupId = Factory.create('group', { owner: adminGroupId })._id;
      setAdminOf._execute({ userId: adminId }, { userId: adminGroupId, groupId });
      setMemberOf._execute({ userId: adminGroupId }, { userId: userGroupId, groupId });
    });
    describe('createBookmark', function () {
      it('does create a new bookmark as member', function () {
        const urlFind = Bookmarks.findOne({ url });
        assert.equal(urlFind, undefined);

        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind2 = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2.url, urlFinal);
        assert.equal(urlFind2.author, userGroupId);
        assert.equal(urlFind2.name, 'Test');
        assert.equal(urlFind2.tag, 'Tag');
      });
      it('does create a new bookmark as admin group', function () {
        const urlFind = Bookmarks.findOne({ url });
        assert.equal(urlFind, undefined);

        const urlFinal = createBookmark._execute({ userId: adminGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind2 = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2.url, urlFinal);
        assert.equal(urlFind2.author, adminGroupId);
        assert.equal(urlFind2.name, 'Test');
        assert.equal(urlFind2.tag, 'Tag');
      });
      it('does create a new bookmark as global admin', function () {
        const urlFind = Bookmarks.findOne({ url });
        assert.equal(urlFind, undefined);

        const urlFinal = createBookmark._execute({ userId: adminId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind2 = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2.url, urlFinal);
        assert.equal(urlFind2.author, adminId);
        assert.equal(urlFind2.name, 'Test');
        assert.equal(urlFind2.tag, 'Tag');
      });
      it("Doesn't create bookmark if url already exists", function () {
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind2 = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2.url, urlFinal);
        assert.equal(urlFind2.author, userGroupId);
        assert.equal(urlFind2.name, 'Test');
        assert.equal(urlFind2.tag, 'Tag');
        assert.throws(
          () => {
            createBookmark._execute({ userId: userGroupId }, { url: urlFinal, name: 'Test', groupId, tag: 'Tag' });
          },
          Meteor.Error,
          /api.bookmarks.createBookmark.URLAlreadyExists/,
        );
      });
      it("Doesn't create bookmark if user is not in group", function () {
        assert.throws(
          () => {
            createBookmark._execute({ userId }, { url, name: 'Test', groupId, tag: 'Tag' });
          },
          Meteor.Error,
          /api.bookmarks.notPermitted/,
        );
      });
    });
    describe('removeBookmark', function () {
      it('does remove URL', function () {
        // Create URL
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.author, userGroupId);

        // Remove URL
        removeBookmark._execute({ userId: userGroupId }, { url: urlFinal, groupId });
        const urlFind2 = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2, undefined);
      });
      it('does group admin can remove any bookmark', function () {
        // Create URL
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.author, userGroupId);

        // Remove URL
        removeBookmark._execute({ userId: userGroupId }, { url: urlFinal, groupId });
        const urlFind2 = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2, undefined);
      });
      it('does global admin can remove any bookmark', function () {
        // Create URL
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.author, userGroupId);

        // Remove URL
        removeBookmark._execute({ userId: adminId }, { url: urlFinal, groupId });
        const urlFind2 = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind2, undefined);
      });
      it('only admin or author can remove URL', function () {
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            removeBookmark._execute({ userId }, { url: urlFinal, groupId });
          },
          Meteor.Error,
          /api.bookmarks.notPermitted/,
        );
      });
      it("Doesn't remove URL that doesn't exists", function () {
        createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            removeBookmark._execute({ userId: userGroupId }, { url: url2, groupId });
          },
          Meteor.Error,
          /api.bookmarks.UnknownURL/,
        );
      });
    });
    describe('updateBookmark', function () {
      it('does update Bookmark as author', function () {
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.author, userGroupId);

        const urlFinal2 = updateBookmark._execute(
          { userId: userGroupId },
          { id: urlFind._id, url, name: 'TestModif', groupId, tag: 'TagModifié' },
        );
        const urlFind2 = Bookmarks.findOne({ url: urlFinal2 });
        assert.equal(urlFind2.url, urlFinal2);
        assert.equal(urlFind2.name, 'TestModif');
        assert.equal(urlFind2.tag, 'TagModifié');
        assert.equal(urlFind2.author, userGroupId);
      });
      it('does update Bookmark as group admin', function () {
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.author, userGroupId);

        const urlFinal2 = updateBookmark._execute(
          { userId: adminGroupId },
          { id: urlFind._id, url, name: 'TestModif', groupId, tag: 'TagModifié' },
        );
        const urlFind2 = Bookmarks.findOne({ url: urlFinal2 });
        assert.equal(urlFind2.url, urlFinal2);
        assert.equal(urlFind2.name, 'TestModif');
        assert.equal(urlFind2.tag, 'TagModifié');
        assert.equal(urlFind2.author, userGroupId);
      });
      it('does update Bookmark as global admin', function () {
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind = Bookmarks.findOne({ url: urlFinal });
        assert.equal(urlFind.url, urlFinal);
        assert.equal(urlFind.name, 'Test');
        assert.equal(urlFind.tag, 'Tag');
        assert.equal(urlFind.author, userGroupId);

        const urlFinal2 = updateBookmark._execute(
          { userId: adminId },
          { id: urlFind._id, url, name: 'TestModif', groupId, tag: 'TagModifié' },
        );
        const urlFind2 = Bookmarks.findOne({ url: urlFinal2 });
        assert.equal(urlFind2.url, urlFinal2);
        assert.equal(urlFind2.name, 'TestModif');
        assert.equal(urlFind2.tag, 'TagModifié');
        assert.equal(urlFind2.author, userGroupId);
      });
      it('only admin or author can update URL', function () {
        const urlFinal = createBookmark._execute({ userId: userGroupId }, { url, name: 'Test', groupId, tag: 'Tag' });
        const urlFind = Bookmarks.findOne({ url: urlFinal });

        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            updateBookmark._execute(
              { userId },
              { id: urlFind._id, url, name: 'TestModif', groupId, tag: 'TagModifié' },
            );
          },
          Meteor.Error,
          /api.bookmarks.notPermitted/,
        );
      });
    });
  });
});
