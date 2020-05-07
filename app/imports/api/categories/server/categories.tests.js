/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { createCategorie, removeCategorie, updateCategorie } from '../methods';
import './publications';
import Categories from '../categories';

describe('categories', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const categorie = Factory.create('categorie');
      assert.typeOf(categorie, 'object');
    });
  });
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      Categories.remove({});
      _.times(4, () => {
        Factory.create('categorie');
      });
    });
    describe('categories.all', function () {
      it('sends all categories', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('categories.all', (collections) => {
          assert.equal(collections.categories.length, 4);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let categoryId;
    let chatData;
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      // FIXME : find a way to reset roles collection ?
      Roles.createRole('admin', { unlessExists: true });
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      const emailAdmin = faker.internet.email();
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
      categoryId = Factory.create('categorie')._id;
      chatData = {
        name: 'application',
      };
    });
    describe('createCategorie', function () {
      it('does create a categorie with admin user', function () {
        createCategorie._execute({ userId: adminId }, chatData);
        const categorie = Categories.findOne({ name: chatData.name });
        assert.typeOf(categorie, 'object');
      });
      it("does not create a categorie if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to create a categorie
        assert.throws(
          () => {
            createCategorie._execute({ userId }, chatData);
          },
          Meteor.Error,
          /api.categories.createCategorie.notPermitted/,
        );
        assert.throws(
          () => {
            createCategorie._execute({}, chatData);
          },
          Meteor.Error,
          /api.categories.createCategorie.notPermitted/,
        );
      });
    });
    describe('removeCategorie', function () {
      it('does delete a categorie with admin user', function () {
        removeCategorie._execute({ userId: adminId }, { categoryId });
        assert.equal(Categories.findOne(categoryId), undefined);
      });
      it("does not delete a categorie if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the categorie
        assert.throws(
          () => {
            removeCategorie._execute({ userId }, { categoryId });
          },
          Meteor.Error,
          /api.categories.removeCategorie.notPermitted/,
        );
        assert.throws(
          () => {
            removeCategorie._execute({}, { categoryId });
          },
          Meteor.Error,
          /api.categories.removeCategorie.notPermitted/,
        );
      });
    });
    describe('updateCategorie', function () {
      it('does update a categorie with admin user', function () {
        const data = {
          name: 'categorie',
        };
        updateCategorie._execute({ userId: adminId }, { categoryId, data });
        const categorie = Categories.findOne(categoryId);
        assert.equal(categorie.name, data.name);
      });
      it("does not update a categorie if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the categorie
        assert.throws(
          () => {
            updateCategorie._execute({ userId }, { categoryId, data: { name: 'categorie' } });
          },
          Meteor.Error,
          /api.categories.updateCategorie.notPermitted/,
        );
        assert.throws(
          () => {
            updateCategorie._execute({}, { categoryId, data: { name: 'categorie' } });
          },
          Meteor.Error,
          /api.categories.updateCategorie.notPermitted/,
        );
      });
    });
  });
});
