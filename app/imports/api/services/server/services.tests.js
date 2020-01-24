/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { createService, removeService, updateService } from '../methods';
import { favService, unfavService } from '../../users/methods';
import './publications';
import Services from '../services';

describe('services', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const service = Factory.create('service');
      assert.typeOf(service, 'object');
      assert.equal(service.target, '_blank');
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
      Services.remove({});
      _.times(4, () => {
        Factory.create('service');
      });
    });
    describe('services.all', function () {
      it('sends all services', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('services.all', (collections) => {
          chai.assert.equal(collections.services.length, 4);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let serviceId;
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
      serviceId = Factory.create('service')._id;
      chatData = {
        title: 'Chat sur MIM',
        description: 'Discuter en direct ',
        url: 'https://chat.mim.ovh',
        logo: 'https://rocket.chat/images/default/logo--dark.svg',
        glyphicon: 'glyphicon-comment',
      };
    });
    describe('createService', function () {
      it('does create a service with admin user', function () {
        createService._execute({ userId: adminId }, chatData);
        const service = Services.findOne({ title: chatData.title });
        assert.typeOf(service, 'object');
        // checks that default values work
        assert.equal(service.target, '_blank');
      });
      it("does not create a service if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to create a service
        assert.throws(
          () => {
            createService._execute({ userId }, chatData);
          },
          Meteor.Error,
          /api.services.createService.notPermitted/,
        );
        assert.throws(
          () => {
            createService._execute({}, chatData);
          },
          Meteor.Error,
          /api.services.createService.notPermitted/,
        );
      });
    });
    describe('removeService', function () {
      it('does delete a service with admin user', function () {
        removeService._execute({ userId: adminId }, { serviceId });
        assert.equal(Services.findOne(serviceId), undefined);
      });
      it("does not delete a service if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the service
        assert.throws(
          () => {
            removeService._execute({ userId }, { serviceId });
          },
          Meteor.Error,
          /api.services.removeService.notPermitted/,
        );
        assert.throws(
          () => {
            removeService._execute({}, { serviceId });
          },
          Meteor.Error,
          /api.services.removeService.notPermitted/,
        );
      });
    });
    describe('updateService', function () {
      it('does update a service with admin user', function () {
        const data = {
          title: 'service',
          description: 'un service',
          url: 'https://mon-service.org',
          logo: 'https://mon-service.org/logo.svg',
        };
        updateService._execute({ userId: adminId }, { serviceId, data });
        const service = Services.findOne(serviceId);
        assert.equal(service.title, data.title);
        assert.equal(service.description, data.description);
        assert.equal(service.url, data.url);
        assert.equal(service.logo, data.logo);
      });
      it("does not update a service if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the service
        assert.throws(
          () => {
            updateService._execute({ userId }, { serviceId, data: { title: 'service' } });
          },
          Meteor.Error,
          /api.services.updateService.notPermitted/,
        );
        assert.throws(
          () => {
            updateService._execute({}, { serviceId, data: { title: 'service' } });
          },
          Meteor.Error,
          /api.services.updateService.notPermitted/,
        );
      });
    });
    describe('(un)favService', function () {
      it('does (un)set a service as favorite', function () {
        favService._execute({ userId }, { serviceId });
        let user = Meteor.users.findOne(userId);
        assert.include(user.favServices, serviceId, 'favorite service list contains serviceId');
        unfavService._execute({ userId }, { serviceId });
        user = Meteor.users.findOne(userId);
        assert.notInclude(user.favServices, serviceId, 'favorite service list does not contains serviceId');
      });
      it('does not set a service as favorite if not logged in', function () {
        assert.throws(
          () => {
            favService._execute({}, { serviceId });
          },
          Meteor.Error,
          /api.users.favService.notPermitted/,
        );
      });
      it('does not unset a service as favorite if not logged in', function () {
        assert.throws(
          () => {
            unfavService._execute({}, { serviceId });
          },
          Meteor.Error,
          /api.users.unfavService.notPermitted/,
        );
      });
    });
  });
});
