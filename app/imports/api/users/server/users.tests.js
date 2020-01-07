/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import faker from 'faker';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import '../../../../i18n/en.i18n.json';

import {
  setAdmin, unsetAdmin, setStructure, setUsername,
} from '../methods';
import { structures } from '../structures';
import './publications';

describe('users', function () {
  describe('publications', function () {
    let userId;
    let email;
    before(function () {
      Meteor.users.remove({});
      _.times(3, () => {
        email = faker.internet.email();
        Accounts.createUser({
          email,
          username: email,
          password: 'toto',
          structure: faker.company.companyName(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        });
      });
      // spécific user for userData publication
      email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'titi',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
    });
    describe('users.all', function () {
      it('sends all users with restricted fields', function (done) {
        const collector = new PublicationCollector();
        collector.collect('users.all', (collections) => {
          chai.assert.equal(collections.users.length, 4);
          const user = collections.users[0];
          assert.notProperty(user, 'favServices');
          done();
        });
      });
      it('sends additional fields for current user', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('userData', (collections) => {
          chai.assert.equal(collections.users.length, 1);
          const user = collections.users[0];
          assert.property(user, 'favServices');
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
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      // FIXME : find a way to reset roles collection ?
      Roles.createRole('admin', { unlessExists: true });
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
      // Create a group owned by userId
    });
    describe('(un)setAdmin', function () {
      it('global admin can set/unset a user as admin', function () {
        assert.equal(Roles.userIsInRole(userId, 'admin'), false);
        setAdmin._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'admin'), true);
        unsetAdmin._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'admin'), false);
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
  });
});
