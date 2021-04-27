/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import AppSettings from '../appsettings';
import { updateAppsettings, updateIntroductionLanguage, getAppSettingsLinks } from '../methods';
import './publications';
import './factories';

describe('appsettings', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const appsetting = Factory.create('appsettings');
      assert.typeOf(appsetting, 'object');
    });
  });
  describe('publications', function () {
    before(function () {
      AppSettings.remove({});
      const appsettinit = {
        _id: 'settings',
        introduction: [
          { language: 'en', content: 'Hello' },
          { language: 'fr', content: 'Salut' },
        ],
        gcu: {
          external: false,
          link: 'gcu_link',
          content: 'gcu_content',
        },
        legal: {
          external: false,
          link: 'legal_link',
          content: 'legal_content',
        },
        accessibility: {
          external: false,
          link: 'a11y_link',
          content: 'a11y_content',
        },
        personalData: {
          external: false,
          link: 'pdata_link',
          content: 'pdata_content',
        },
      };
      AppSettings.insert(appsettinit);
    });
    describe('appsettings.all', function () {
      it('sends the only complet appsetting object', function (done) {
        const collector = new PublicationCollector({});
        collector.collect('appsettings.all', {}, (collections) => {
          assert.equal(collections.appsettings.length, 1);
          const appall = collections.appsettings[0];
          assert.property(appall, 'introduction');
          assert.property(appall, 'gcu');
          assert.property(appall, 'legal');
          assert.property(appall, 'accessibility');
          assert.property(appall, 'personalData');
          done();
        });
      });
    });
    describe('appsettings.introduction', function () {
      it('sends the appsetting introduction', function (done) {
        const collector = new PublicationCollector({});
        collector.collect('appsettings.introduction', {}, (collections) => {
          const appintro = collections.appsettings[0];
          assert.property(appintro, 'introduction');
          assert.typeOf(appintro.introduction, 'array');
          assert.lengthOf(appintro.introduction, 2);
          done();
        });
      });
    });
    describe('appsettings.gcu', function () {
      it('sends the appsetting gcu', function (done) {
        const collector = new PublicationCollector({});
        collector.collect('appsettings.gcu', {}, (collections) => {
          const appgcu = collections.appsettings[0];
          assert.property(appgcu, 'gcu');
          assert.typeOf(appgcu.gcu, 'object');
          assert.property(appgcu.gcu, 'external');
          assert.property(appgcu.gcu, 'link');
          assert.property(appgcu.gcu, 'content');
          done();
        });
      });
    });
    describe('appsettings.legal', function () {
      it('sends the appsetting legal', function (done) {
        const collector = new PublicationCollector({});
        collector.collect('appsettings.legal', {}, (collections) => {
          const applegal = collections.appsettings[0];
          assert.property(applegal, 'legal');
          assert.typeOf(applegal.legal, 'object');
          assert.property(applegal.legal, 'external');
          assert.property(applegal.legal, 'link');
          assert.property(applegal.legal, 'content');
          done();
        });
      });
    });
    describe('appsettings.accessibility', function () {
      it('sends the appsetting accessibility', function (done) {
        const collector = new PublicationCollector({});
        collector.collect('appsettings.accessibility', {}, (collections) => {
          const appa11y = collections.appsettings[0];
          assert.property(appa11y, 'accessibility');
          assert.typeOf(appa11y.accessibility, 'object');
          assert.property(appa11y.accessibility, 'external');
          assert.property(appa11y.accessibility, 'link');
          assert.property(appa11y.accessibility, 'content');
          done();
        });
      });
    });
    describe('appsettings.personalData', function () {
      it('sends the appsetting personalData', function (done) {
        const collector = new PublicationCollector({});
        collector.collect('appsettings.personalData', {}, (collections) => {
          const apppersData = collections.appsettings[0];
          assert.property(apppersData, 'personalData');
          assert.typeOf(apppersData.personalData, 'object');
          assert.property(apppersData.personalData, 'external');
          assert.property(apppersData.personalData, 'link');
          assert.property(apppersData.personalData, 'content');
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let adminId;
    let userId;
    beforeEach(function () {
      // Clear
      AppSettings.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Roles.createRole('admin');

      // Insert AppSetting
      const appsettinit = {
        _id: 'settings',
        introduction: [
          { language: 'en', content: 'Hello' },
          { language: 'fr', content: 'Salut' },
        ],
        gcu: {
          external: false,
          link: 'gcu_link',
          content: 'gcu_content',
        },
        legal: {
          external: false,
          link: 'legal_link',
          content: 'legal_content',
        },
        accessibility: {
          external: false,
          link: 'a11y_link',
          content: 'a11y_content',
        },
        personalData: {
          external: false,
          link: 'pdata_link',
          content: 'pdata_content',
        },
      };
      AppSettings.insert(appsettinit);

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
    });
    describe('updateAppsettings', function () {
      it('normal users can not update app settings', function () {
        assert.throws(
          () => {
            updateAppsettings._execute({ userId }, { key: 'gcu', content: 'yooo' });
          },
          Meteor.Error,
          /api.appsettings.updateAppsettings.notPermitted/,
        );
      });
      it('admin can update app settings', function () {
        updateAppsettings._execute({ userId: adminId }, { key: 'gcu', content: 'yooo', link: 'http', external: 0 });
        const appsett = AppSettings.findOne({ _id: 'settings' });
        assert.equal(appsett.gcu.content, 'yooo');
        assert.equal(appsett.gcu.link, 'http');
        assert.equal(appsett.gcu.external, 0);
      });
    });
    describe('updateIntroductionLanguage', function () {
      it('normal users can not update introduction language in app settings', function () {
        assert.throws(
          () => {
            updateIntroductionLanguage._execute({ userId }, { language: 'fr', content: 'coucou' });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
      });
      it('admin can update app settings', function () {
        updateIntroductionLanguage._execute({ userId: adminId }, { language: 'fr', content: 'coucou' });
        const appsett = AppSettings.findOne({
          _id: 'settings',
          introduction: { $elemMatch: { language: 'fr', content: 'coucou' } },
        });
        assert.typeOf(appsett, 'object');
      });
    });
    describe('getAppSettingsLinks', function () {
      it('get all links of app settings', function () {
        const allLinks = getAppSettingsLinks._execute({ userId });
        assert.typeOf(allLinks, 'object');
        assert.notProperty(allLinks.gcu, 'content');
        assert.notProperty(allLinks.legal, 'content');
        assert.notProperty(allLinks.accessibility, 'content');
        assert.notProperty(allLinks.personalData, 'content');
      });
    });
  });
});
