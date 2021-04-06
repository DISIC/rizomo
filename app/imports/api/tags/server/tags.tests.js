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

import { createTag, removeTag, updateTag } from '../methods';
import Tags from '../tags';
import './publications';
import './factories';
import Articles from '../../articles/articles';
import '../../articles/server/factories';

describe('tags', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const tag = Factory.create('tag');
      assert.typeOf(tag, 'object');
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
      Tags.remove({});
      _.times(4, () => {
        Factory.create('tag');
      });
    });
    describe('tags.all', function () {
      it('sends all tags', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('tags.all', (collections) => {
          assert.equal(collections.tags.length, 4);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let tagName;
    let tagId;
    let tagData;
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
      const theTag = Factory.create('tag');
      tagId = theTag._id;
      tagName = theTag.name;
      tagData = {
        name: 'application',
      };
    });
    describe('createTag', function () {
      it('does create a tag with admin user', function () {
        createTag._execute({ userId }, tagData);
        const tag = Tags.findOne({ name: tagData.name });
        assert.typeOf(tag, 'object');
      });
      // it("does not create a tag if you're not admin", function () {
      //   // Throws if non admin user, or logged out user, tries to create a tag
      //   assert.throws(
      //     () => {
      //       createTag._execute({ userId }, tagData);
      //     },
      //     Meteor.Error,
      //     /api.tags.createTag.notPermitted/,
      //   );
      //   assert.throws(
      //     () => {
      //       createTag._execute({}, tagData);
      //     },
      //     Meteor.Error,
      //     /api.tags.createTag.notPermitted/,
      //   );
      // });
    });
    describe('removeTag', function () {
      it('does delete a tag with admin user', function () {
        removeTag._execute({ userId: adminId }, { tagId });
        assert.equal(Tags.findOne(tagId), undefined);
      });
      it('does not remove the tag from an article when deleted', function () {
        const oneArticleId = Factory.create('article', { title: 'test', tags: [tagName] })._id;
        removeTag._execute({ userId: adminId }, { tagId });
        assert.equal(Tags.findOne(tagId), undefined);
        assert.equal(Articles.findOne(oneArticleId).tags.length, 1);
      });
      it("does not delete a tag if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the tag
        assert.throws(
          () => {
            removeTag._execute({ userId }, { tagId });
          },
          Meteor.Error,
          /api.tags.removeTag.notPermitted/,
        );
        assert.throws(
          () => {
            removeTag._execute({}, { tagId });
          },
          Meteor.Error,
          /api.tags.removeTag.notPermitted/,
        );
      });
    });
    describe('updateTag', function () {
      it('does update a tag with admin user', function () {
        const data = {
          name: 'tag',
        };
        updateTag._execute({ userId: adminId }, { tagId, data });
        const tag = Tags.findOne(tagId);
        assert.equal(tag.name, data.name);
      });
      it("does not update a tag if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the tag
        assert.throws(
          () => {
            updateTag._execute({ userId }, { tagId, data: { name: 'tag' } });
          },
          Meteor.Error,
          /api.tags.updateTag.notPermitted/,
        );
        assert.throws(
          () => {
            updateTag._execute({}, { tagId, data: { name: 'tag' } });
          },
          Meteor.Error,
          /api.tags.updateTag.notPermitted/,
        );
      });
    });
  });
});
