/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import '../../../../i18n/en.i18n.json';

import {
  setAdmin,
  unsetAdmin,
  setStructure,
  setUsername,
  setName,
  setEmail,
  setLanguage,
  setLogoutType,
  setActive,
  unsetActive,
  findUsers,
  findUser,
  removeUser,
  setMemberOf,
  setKeycloakId,
} from './methods';
import { structures } from '../structures';
import Groups from '../../groups/groups';
import PersonalSpaces from '../../personalspaces/personalspaces';
import './publications';

describe('users', function () {
  describe('publications', function () {
    let userId;
    let otherUserId;
    let email;
    let group;
    const lastName = `test${faker.name.lastName()}`;
    const firstName = `test${faker.name.firstName()}`;
    before(function () {
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Roles.createRole('admin');
      Roles.createRole('member');
      _.times(3, () => {
        // prefix email with 'test' to make sure it won't match
        // with 'user@ac-test.fr' when testing filtered search
        email = `test${faker.internet.email()}`;
        Accounts.createUser({
          email,
          username: email,
          password: 'toto',
          structure: faker.company.companyName(),
          firstName: `test${faker.name.firstName()}`,
          lastName: `test${faker.name.lastName()}`,
        });
      });
      // spécific users for userData publication and search filter test
      email = 'user@ac-test.fr';
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'titi',
        structure: faker.company.companyName(),
        firstName,
        lastName,
      });
      email = `test${faker.internet.email()}`;
      otherUserId = Accounts.createUser({
        email,
        username: email,
        password: 'titi',
        structure: faker.company.companyName(),
        firstName: 'BobLeFilou',
        lastName: `test${faker.name.lastName()}`,
      });

      Meteor.users.update(userId, { $set: { isActive: true, isRequest: false, articlesCount: 1 } });
      Meteor.users.update(otherUserId, { $set: { isActive: true, isRequest: false, articlesCount: 1 } });
      group = Factory.create('group', { owner: userId });
      setMemberOf._execute({ userId }, { userId, groupId: group._id });
      setMemberOf._execute({ userId: otherUserId }, { userId: otherUserId, groupId: group._id });
    });
    describe('users.request', function () {
      it('does not send data to non admin users', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.request', (collections) => {
          assert.equal(collections.users, undefined);
          done();
        });
      });
      it('sends users awaiting for activation to admin user', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.request', (collections) => {
          assert.equal(collections.users.length, 3);
          done();
        });
        Roles.removeUsersFromRoles(userId, 'admin');
      });
    });
    describe('userData', function () {
      it('sends additional fields for current user', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('userData', (collections) => {
          assert.equal(collections.users.length, 1);
          const user = collections.users[0];
          assert.property(user, 'favServices');
          done();
        });
      });
    });
    describe('users.findUsers method', function () {
      it('fetches a page of users as normal user', function () {
        const { data, page, totalCount } = findUsers._execute({ userId }, { pageSize: 2 });
        assert.equal(data.length, 2);
        assert.equal(page, 1);
        assert.equal(totalCount, 5);
      });
      it('fetches a page of users as normal user with a filter', function () {
        const { data, page, totalCount } = findUsers._execute({ userId }, { filter: 'user@ac-test.fr' });
        assert.equal(data.length, 1);
        assert.equal(page, 1);
        assert.equal(totalCount, 1);
        assert.notProperty(data[0], 'createdAt');
        assert.equal(data[0].emails[0].address, 'user@ac-test.fr');
      });
      it('fetches a page of users as admin user', function () {
        Roles.addUsersToRoles(userId, 'admin');
        let results = findUsers._execute({ userId }, { pageSize: 3 });
        assert.equal(results.data.length, 3);
        assert.equal(results.page, 1);
        assert.equal(results.totalCount, 5);
        assert.property(results.data[0], 'createdAt');
        // fetch page 2
        results = findUsers._execute({ userId }, { pageSize: 3, page: 2 });
        assert.equal(results.data.length, 2);
        assert.equal(results.page, 2);
        assert.equal(results.totalCount, 5);
      });
    });
    describe('users.findUser method', function () {
      it('fetches basic info of a specific user (firstname, lastname)', function () {
        const userData = findUser._execute({ userId }, { userId });
        assert.equal(userData._id, userId);
        assert.equal(userData.lastName, lastName);
        assert.equal(userData.firstName, firstName);
      });
    });
    describe('roles.admin', function () {
      it('sends all global admin users', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('roles.admin', (collections) => {
          assert.equal(collections['role-assignment'].length, 1);
          const assignment = collections['role-assignment'][0];
          assert.equal(assignment.user._id, userId);
          assert.equal(assignment.role._id, 'admin');
          done();
        });
      });
    });
    describe('users.group', function () {
      it('sends all users from a group', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.group', { page: 1, itemPerPage: 5, slug: group.slug, search: '' }, (collections) => {
          assert.equal(collections.users.length, 2);
          assert.equal(
            collections.users.filter((user) => [firstName, 'BobLeFilou'].includes(user.firstName)).length,
            2,
          );
          done();
        });
      });
      it('sends all users from a group with filter', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group.slug, search: 'BobLeFilou' },
          (collections) => {
            assert.equal(collections.users.length, 1);
            assert.equal(collections.users[0].firstName, 'BobLeFilou');
            done();
          },
        );
      });
    });
    describe('users.publishers', function () {
      it('sends all users who published an article', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.publishers', { page: 1, itemPerPage: 5, search: '' }, (collections) => {
          assert.equal(collections.users.length, 2);
          const user = collections.users[0];
          assert.equal(user._id, userId);
          done();
        });
      });
      it('sends all users who published an article with filter', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.publishers', { page: 1, itemPerPage: 5, search: 'BobLeFilou' }, (collections) => {
          assert.equal(collections.users.length, 1);
          const user = collections.users[0];
          assert.equal(user._id, otherUserId);
          done();
        });
      });
    });
    describe('users.admin', function () {
      it('sends all users including admin restricted fields', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.admin', { page: 1, itemPerPage: 5, search: '' }, (collections) => {
          assert.equal(collections.users.length, 5);
          const user = collections.users[0];
          assert.property(user, 'createdAt');
          done();
        });
      });
      it('sends a specific page of users including admin restricted fields', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.admin', { page: 2, itemPerPage: 3, search: '' }, (collections) => {
          assert.equal(collections.users.length, 2);
          done();
        });
      });
      it('sends all users including admin restricted fields matching a filter', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.admin', { page: 1, itemPerPage: 5, search: 'user@ac-test.fr' }, (collections) => {
          assert.equal(collections.users.length, 1);
          assert.equal(collections.users[0].emails[0].address, 'user@ac-test.fr');
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let email;
    let emailAdmin;
    let groupId;
    beforeEach(function () {
      // Clear
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Groups.remove({});
      PersonalSpaces.remove({});
      Roles.createRole('admin');
      Roles.createRole('member');
      // Generate 'users'
      email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      // create a group and set userId as member
      groupId = Factory.create('group', { owner: adminId })._id;
      setMemberOf._execute({ userId: adminId }, { userId, groupId });
    });
    describe('(un)setAdmin', function () {
      it('global admin can set/unset a user as admin', function () {
        assert.equal(Roles.userIsInRole(userId, 'admin'), false);
        setAdmin._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'admin'), true);
        unsetAdmin._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'admin'), false);
      });
      it('last admin user can not unset himself as admin', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            unsetAdmin._execute({ userId: adminId }, { userId: adminId });
          },
          Meteor.Error,
          /api.users.unsetAdmin.lastAdmin/,
        );
      });
      it('only global admin can set/unset a user as admin', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            setAdmin._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.setAdmin.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdmin._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.unsetAdmin.notPermitted/,
        );
        assert.throws(
          () => {
            setAdmin._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.setAdmin.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdmin._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.unsetAdmin.notPermitted/,
        );
      });
    });
    describe('setUsername', function () {
      it('users can set their username', function () {
        setUsername._execute({ userId }, { username: 'moi' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.username, 'moi');
      });
      it('users can not set their username to already taken values', function () {
        assert.throws(
          () => {
            setUsername._execute({ userId }, { username: emailAdmin });
          },
          Meteor.Error,
          /Username already exists. \[403\]/,
        );
      });
      it('only logged in users can set their username', function () {
        assert.throws(
          () => {
            setUsername._execute({}, { username: 'moi' });
          },
          Meteor.Error,
          /api.users.setUsername.notLoggedIn/,
        );
      });
    });
    describe('setStructure', function () {
      it('users can set their structure', function () {
        const newStructure = structures[0];
        setStructure._execute({ userId }, { structure: newStructure });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.structure, newStructure);
      });
      it('users can only set their structure to allowed values', function () {
        assert.throws(
          () => {
            setStructure._execute({ userId }, { structure: 'toto' });
          },
          Meteor.ClientError,
          /toto is not an allowed value/,
        );
      });
      it('only logged in users can set their structure', function () {
        const newStructure = structures[0];
        assert.throws(
          () => {
            setStructure._execute({}, { structure: newStructure });
          },
          Meteor.Error,
          /api.users.setStructure.notLoggedIn/,
        );
      });
    });
    describe('setName', function () {
      it('users can set their firstname and lastname', function () {
        setName._execute({ userId }, { firstName: 'newFirstname', lastName: 'newLastname' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.firstName, 'newFirstname');
        assert.equal(user.lastName, 'newLastname');
      });
      it('only logged in users can set their name', function () {
        assert.throws(
          () => {
            setName._execute({}, { firstName: 'newFirstname', lastName: 'newLastname' });
          },
          Meteor.Error,
          /api.users.setName.notLoggedIn/,
        );
      });
    });
    describe('setEmail', function () {
      it('users can set their email address', function () {
        setEmail._execute({ userId }, { email: 'toto@test.org' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.emails[0].address, 'toto@test.org');
        assert.equal(user.emails[0].verified, false);
      });
      it('users can not use an already existing email address', function () {
        assert.throws(
          () => {
            setEmail._execute({ userId }, { email: emailAdmin });
          },
          Meteor.Error,
          /Email already exists. \[403\]/,
        );
      });
      it('only logged in users can set their email address', function () {
        assert.throws(
          () => {
            setEmail._execute({}, { email: 'toto@test.org' });
          },
          Meteor.Error,
          /api.users.setEmail.notLoggedIn/,
        );
      });
    });
    describe('setLanguage', function () {
      it('users can set their preferred language', function () {
        setLanguage._execute({ userId }, { language: 'fr' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.language, 'fr');
      });
      it('only logged in users can set their language', function () {
        assert.throws(
          () => {
            setLanguage._execute({}, { language: 'fr' });
          },
          Meteor.Error,
          /api.users.setLanguage.notPermitted/,
        );
      });
    });
    describe('setLogoutType', function () {
      it('users can set their preferred logout method', function () {
        setLogoutType._execute({ userId }, { logoutType: 'local' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.logoutType, 'local');
      });
      it('only logged in users can set their language', function () {
        assert.throws(
          () => {
            setLogoutType._execute({}, { logoutType: 'local' });
          },
          Meteor.Error,
          /api.users.setLogoutType.notPermitted/,
        );
      });
    });
    describe('setKeycloakId', function () {
      it('admin users can set Keycloak Id of an existing user', function () {
        setKeycloakId._execute({ userId: adminId }, { email, keycloakId: 'f213b75d-9133-4ca7-9499-e43f15e254b6' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.services.keycloak.id, 'f213b75d-9133-4ca7-9499-e43f15e254b6');
      });
      it('only admin users can set keycloak Id of an existing user', function () {
        assert.throws(
          () => {
            setKeycloakId._execute({ userId }, { email, keycloakId: 'f213b75d-9133-4ca7-9499-e43f15e254b6' });
          },
          Meteor.Error,
          /api.users.setKeycloakId.notPermitted/,
        );
      });
    });
    describe('removeUser', function () {
      it('global admin can remove an existing user and associated data', function () {
        // check that user data exists before deletion
        let pspace = PersonalSpaces.findOne({ userId });
        assert.property(pspace, 'unsorted');
        let group = Groups.findOne(groupId);
        assert.include(group.members, userId);
        assert.equal(Roles.userIsInRole(userId, 'member', groupId), true);
        removeUser._execute({ userId: adminId }, { userId });
        const user = Meteor.users.findOne(userId);
        // check that personalspace, roles and group entries are removed
        assert.equal(user, undefined);
        group = Groups.findOne(groupId);
        assert.notInclude(group.members, userId);
        assert.equal(Roles.userIsInRole(userId, 'member', groupId), false);
        pspace = PersonalSpaces.findOne({ userId });
        assert.equal(pspace, undefined);
      });
      it('non admin users can remove their own account and associated data', function () {
        let user = Meteor.users.findOne(userId);
        removeUser._execute({ userId }, { userId });
        user = Meteor.users.findOne(userId);
        assert.equal(user, undefined);
        // check that personalspace, roles and group entries are removed
      });
      it('only global admin can remove another user', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            removeUser._execute({ userId }, { userId: adminId });
          },
          Meteor.Error,
          /api.users.removeUser.notPermitted/,
        );
        assert.throws(
          () => {
            removeUser._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.removeUser.notPermitted/,
        );
      });
    });
    describe('(un)setActive', function () {
      it('global admin can set a user as active/not active', function () {
        let user = Meteor.users.findOne(userId);
        assert.equal(user.isActive, true);
        unsetActive._execute({ userId: adminId }, { userId });
        user = Meteor.users.findOne(userId);
        assert.equal(user.isActive, false);
        setActive._execute({ userId: adminId }, { userId });
        user = Meteor.users.findOne(userId);
        assert.equal(user.isActive, true);
      });
      it('only global admin can set a user as active/not active', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            setActive._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.setActive.notPermitted/,
        );
        assert.throws(
          () => {
            setActive._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.setActive.notPermitted/,
        );
        assert.throws(
          () => {
            unsetActive._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.unsetActive.notPermitted/,
        );
        assert.throws(
          () => {
            unsetActive._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.unsetActive.notPermitted/,
        );
      });
    });
  });
});
