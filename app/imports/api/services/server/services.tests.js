/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { createService, removeService, updateService, favService, unfavService } from '../methods';

import './publications';
import './factories';
import Services from '../services';
import Categories from '../../categories/categories';
import '../../categories/server/factories';
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
    let oneServiceId;
    let structureServiceId;
    let categoryId;
    let groupServiceId;
    let userStruct;
    beforeEach(function () {
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Categories.remove({});
      Roles.createRole('admin');
      Roles.createRole('adminStructure');
      const email = faker.internet.email();
      userStruct = faker.company.companyName();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: userStruct,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      Services.remove({});
      _.times(3, () => {
        Factory.create('service', { title: `test${Random.id()}` });
      });
      structureServiceId = Factory.create('service', { title: 'structureService', structure: userStruct })._id;
      Factory.create('service', { title: 'otherStructureService', structure: 'otherStructure' });
      categoryId = Factory.create('categorie')._id;
      oneServiceId = Factory.create('service', { title: 'test', categories: [categoryId] })._id;
      groupServiceId = Factory.create('service')._id;
    });
    describe('services.all', function () {
      it('sends all services (except structure specific ones)', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('services.all', (collections) => {
          assert.equal(collections.services.length, 5);
          // check that structure specific service is not present
          assert.equal(collections.services.filter((serv) => serv._id === structureServiceId).length, 0);
          done();
        });
      });
    });
    describe('services.structure', function () {
      it('sends all user structure specific services', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('services.structure', (collections) => {
          assert.equal(collections.services.length, 1);
          assert.equal(collections.services[0]._id, structureServiceId);
          done();
        });
      });
    });
    describe('services.one.admin', function () {
      it('sends one service to admin or adminStructure user only', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('services.one.admin', { _id: oneServiceId }, (collections) => {
          // non admin user : no result
          assert.notProperty(collections, 'services');
        });
        Roles.addUsersToRoles(userId, 'adminStructure', userStruct);
        const structureCollector = new PublicationCollector({ userId });
        structureCollector.collect('services.one.admin', { _id: structureServiceId }, (collections) => {
          assert.equal(collections.services.length, 1);
          assert.equal(collections.services[0]._id, structureServiceId);
          assert.property(collections.services[0], 'content');
        });
        Roles.removeUsersFromRoles(userId, 'adminStructure', userStruct);
        Roles.addUsersToRoles(userId, 'admin');
        const adminCollector = new PublicationCollector({ userId });
        adminCollector.collect('services.one.admin', { _id: oneServiceId }, (collections) => {
          assert.equal(collections.services.length, 1);
          assert.equal(collections.services[0]._id, oneServiceId);
          assert.property(collections.services[0], 'content');
        });
        done();
      });
    });
    describe('services.group', function () {
      it('sends services from a list of services ids', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('services.group', { ids: [oneServiceId, groupServiceId] }, (collections) => {
          assert.equal(collections.services.length, 2);
          assert.equal(
            collections.services.filter((serv) => [oneServiceId, groupServiceId].includes(serv._id)).length,
            2,
          );
          done();
        });
      });
    });
    describe('services.one', function () {
      it('sends one service and corresponding categories selected by service slug', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('services.one', { slug: 'test' }, (collections) => {
          assert.equal(collections.services.length, 1);
          assert.equal(collections.categories.length, 1);
          assert.equal(collections.services[0]._id, oneServiceId);
          assert.equal(collections.categories[0]._id, categoryId);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let adminStructureId;
    let serviceId;
    let structureServiceId;
    let otherStructureServiceId;
    let chatData;
    beforeEach(function () {
      // Clear
      Services.remove({});
      PersonalSpaces.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Roles.createRole('admin');
      Roles.createRole('adminStructure');
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: 'maStructure',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      const emailAdminStructure = `struct${faker.internet.email()}`;
      adminStructureId = Accounts.createUser({
        email: emailAdminStructure,
        username: emailAdminStructure,
        password: 'toto',
        structure: 'maStructure',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      const emailAdmin = `admin${faker.internet.email()}`;
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: 'maStructure',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      Roles.addUsersToRoles(adminStructureId, 'adminStructure', 'maStructure');
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      serviceId = Factory.create('service')._id;
      structureServiceId = Factory.create('service', { structure: 'maStructure' })._id;
      otherStructureServiceId = Factory.create('service', { structure: 'autreStructure' })._id;
      // add service to userId favorites
      Meteor.users.update({ _id: userId }, { $set: { favServices: [serviceId, structureServiceId] } });
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
        state: 0,
        structure: '',
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
      it('does create a structure specific service with adminStructure user', function () {
        createService._execute({ userId: adminStructureId }, { ...chatData, structure: 'maStructure' });
        const service = Services.findOne({ title: chatData.title });
        assert.typeOf(service, 'object');
      });
      it('does create a structure specific service with adminStructure user', function () {
        createService._execute({ userId: adminId }, { ...chatData, structure: 'uneStructure' });
        const service = Services.findOne({ title: chatData.title });
        assert.typeOf(service, 'object');
      });
      it("does not create a structure specific service if you're not adminStructure or admin", function () {
        // Throws if non admin user, or logged out user, tries to create a service
        assert.throws(
          () => {
            createService._execute({ userId }, { ...chatData, structure: 'maStructure' });
          },
          Meteor.Error,
          /api.services.createService.notPermitted/,
        );
        assert.throws(
          () => {
            createService._execute({}, { ...chatData, structure: 'maStructure' });
          },
          Meteor.Error,
          /api.services.createService.notPermitted/,
        );
      });
      it('does not create a structure specific service for another structure', function () {
        // Throws if non admin user, or logged out user, tries to create a service
        assert.throws(
          () => {
            createService._execute({ userId: adminStructureId }, { ...chatData, structure: 'autreStructure' });
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
      it('does delete a structure specific service with adminStructure user', function () {
        removeService._execute({ userId: adminStructureId }, { serviceId: structureServiceId });
        assert.equal(Services.findOne(structureServiceId), undefined);
        // check that service has been removed from userId favorites
        assert.equal(Meteor.users.findOne({ favServices: { $all: [structureServiceId] } }), undefined);
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
            removeService._execute({ userId }, { serviceId: structureServiceId });
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
        assert.throws(
          () => {
            removeService._execute({}, { serviceId: structureServiceId });
          },
          Meteor.Error,
          /api.services.removeService.notPermitted/,
        );
      });
      it("does not delete service for another structure if you're adminStructure", function () {
        assert.throws(
          () => {
            removeService._execute({ userId: adminStructureId }, { serviceId: otherStructureServiceId });
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
        state: 0,
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
      it('does update a structure specific service with adminStructure user', function () {
        updateService._execute({ userId: adminStructureId }, { serviceId: structureServiceId, data: { ...data } });
        const service = Services.findOne(structureServiceId);
        assert.equal(service.title, data.title);
        assert.equal(service.description, data.description);
        assert.equal(service.url, data.url);
        assert.equal(service.logo, data.logo);
        assert.equal(service.team, data.team);
        assert.equal(service.usage, data.usage);
        assert.deepEqual(service.screenshots, data.screenshots);
        assert.equal(service.content, data.content);
      });
      it("does not update a service if you're not admin or structureAdmin", function () {
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
            updateService._execute({ userId }, { serviceId: structureServiceId, data });
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
      it("does not update a global ot other structure service if you're structureAdmin", function () {
        // Throws if non admin user, or logged out user, tries to delete the service
        assert.throws(
          () => {
            updateService._execute({ userId: adminStructureId }, { serviceId, data });
          },
          Meteor.Error,
          /api.services.updateService.notPermitted/,
        );
        assert.throws(
          () => {
            updateService._execute({ userId: adminStructureId }, { serviceId: otherStructureServiceId, data });
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
