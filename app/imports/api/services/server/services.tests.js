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

import {
  createService, removeService, updateService, favService, unfavService,
} from '../methods';

import './publications';
import Services from '../services';
import PersonalSpaces from '../../personalspaces/personalspaces';

function pspaceHasService(user, id) {
  const pspace = PersonalSpaces.findOne({
    userId: user,
    unsorted: { $elemMatch: { type: 'service', element_id: id } },
  });
  const inFavs = Meteor.users.findOne(user).favServices.includes(id);
  return pspace !== undefined && inFavs;
}

describe('services', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const service = Factory.create('service');
      assert.typeOf(service, 'object');
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
          assert.equal(collections.services.length, 4);
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
      Services.remove({});
      PersonalSpaces.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Roles.createRole('admin');
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
      // add service to userId favorites
      Meteor.users.update({ _id: userId }, { $set: { favServices: [serviceId] } });
      chatData = {
        title: 'Chat sur un nuage de liconre',
        description: "Chevaucher un dragon rose à pois. C'est en fait une fée pour piéger Peter Pan",
        url: 'https://chat.licorne.ovh',
        logo: 'https://rocket.chat/images/default/logo--dark.svg',
        categories: [],
        team: 'Dijon',
        usage: 'Discuter en Troubadour',
        screenshots: [],
        content: "<div>c'est un service de fou</div>",
      };
    });
    describe('createService', function () {
      it('does create a service with admin user', function () {
        createService._execute({ userId: adminId }, chatData);
        const service = Services.findOne({ title: chatData.title });
        assert.typeOf(service, 'object');
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
        // check that service has been removed from userId favorites
        assert.equal(Meteor.users.findOne({ favServices: { $all: [serviceId] } }), undefined);
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
      const data = {
        title: 'Chat sur MIMOSA',
        description: "Chevaucher un dragon rose à pois. C'est en fait une fée pour piéger Peter Pan",
        usage: 'Discuter en Troubadour',
        url: 'https://chat.licorne.ovh',
        logo: 'https://rocket.chat/images/default/logo--dark.svg',
        categories: [],
        team: 'Dijon',
        screenshots: ['https://rocket.chat/images/default/logo--dark.svg'],
        content: "<div>c'est un service de fou</div>",
      };
      it('does update a service with admin user', function () {
        updateService._execute({ userId: adminId }, { serviceId, data: { ...data } });
        const service = Services.findOne(serviceId);
        assert.equal(service.title, data.title);
        assert.equal(service.description, data.description);
        assert.equal(service.url, data.url);
        assert.equal(service.logo, data.logo);
        assert.equal(service.team, data.team);
        assert.equal(service.usage, data.usage);
        assert.deepEqual(service.screenshots, data.screenshots);
        assert.equal(service.content, data.content);
      });
      it("does not update a service if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the service
        assert.throws(
          () => {
            updateService._execute({ userId }, { serviceId, data });
          },
          Meteor.Error,
          /api.services.updateService.notPermitted/,
        );
        assert.throws(
          () => {
            updateService._execute({}, { serviceId, data });
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
        assert.equal(pspaceHasService(userId, serviceId), true, 'service is in personal space');
        unfavService._execute({ userId }, { serviceId });
        user = Meteor.users.findOne(userId);
        assert.notInclude(user.favServices, serviceId, 'favorite service list does not contains serviceId');
        assert.equal(pspaceHasService(userId, serviceId), false, 'service is no longer in personal space');
      });
      it('does not set a service as favorite if not logged in', function () {
        assert.throws(
          () => {
            favService._execute({}, { serviceId });
          },
          Meteor.Error,
          /api.services.favService.notPermitted/,
        );
      });
      it('does not unset a service as favorite if not logged in', function () {
        assert.throws(
          () => {
            unfavService._execute({}, { serviceId });
          },
          Meteor.Error,
          /api.services.unfavService.notPermitted/,
        );
      });
    });
  });
});
