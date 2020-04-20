/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';

import { createArticle, removeArticle, updateArticle } from '../methods';
import './publications';
import Articles from '../articles';

describe('articles', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const article = Factory.create('article');
      assert.typeOf(article, 'object');
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
      Articles.remove({});
      _.times(4, () => {
        Factory.create('article', { userId });
      });
      _.times(2, () => {
        Factory.create('article', { userId: Random.id() });
      });
    });
    describe('articles.all', function () {
      it('sends all services', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.all', { userId }, (collections) => {
          chai.assert.equal(collections.articles.length, 4);
          done();
        });
        const nbArticles = Meteor.call('get_articles.all_count', { userId });
        assert.equal(nbArticles, 4);
      });
    });
  });
  describe('methods', function () {
    let userId;
    let otherUserId;
    let articleId;
    let articleData;
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
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
      otherUserId = Accounts.createUser({
        email: faker.internet.email(),
        username: 'otherUser',
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      articleData = {
        title: 'Chat sur un nuage de licorne',
        description: "Chevaucher un dragon rose à pois. C'est en fait une fée pour piéger Peter Pan",
        content: "<div>c'est un article de fou</div>",
      };
      articleId = Factory.create('article', { userId })._id;
    });
    describe('createArticle', function () {
      it('does create an article with basic user', function () {
        createArticle._execute({ userId }, { data: articleData });
        const article = Articles.findOne({ title: articleData.title, userId });
        assert.typeOf(article, 'object');
        assert.equal(article.slug.search('chat-sur-un-nuage-de-licorne') !== -1, true);
      });
      it("does not create an article if you're not logged in", function () {
        // Throws if logged out user, tries to create an article
        assert.throws(
          () => {
            createArticle._execute({}, { data: articleData });
          },
          Meteor.Error,
          /api.articles.createArticle.notLoggedIn/,
        );
      });
    });
    describe('removeArticle', function () {
      it('does delete an article belonging to user', function () {
        removeArticle._execute({ userId }, { articleId });
        assert.equal(Articles.findOne(articleId), undefined);
      });
      it("does not delete a service you're not autor of", function () {
        // Throws if non author, or logged out user, tries to delete an article
        assert.throws(
          () => {
            removeArticle._execute({ userId: otherUserId }, { articleId });
          },
          Meteor.Error,
          /api.articles.removeArticle.notPermitted/,
        );
        assert.throws(
          () => {
            removeArticle._execute({}, { articleId });
          },
          Meteor.Error,
          /api.articles.removeArticle.notLoggedIn/,
        );
      });
    });
    describe('updateArticle', function () {
      const data = {
        title: 'Chat sur MIMOSA',
        description: 'article modifié',
        content: "<div>c'est toujours un article de fou</div>",
      };
      it('does update an article with author user', function () {
        const oldDate = Articles.findOne(articleId).updatedAt;
        updateArticle._execute({ userId }, { articleId, data });
        const article = Articles.findOne(articleId);
        assert.equal(article.title, data.title);
        assert.equal(article.description, data.description);
        assert.equal(article.content, data.content);
        assert.notEqual(oldDate, article.updatedAt);
      });
      it("does not update an article if you're not author", function () {
        // Throws if non author user, or logged out user, tries to update the article
        assert.throws(
          () => {
            updateArticle._execute({ otherUserId }, { articleId, data });
          },
          Meteor.Error,
          /api.articles.updateArticle.notPermitted/,
        );
        assert.throws(
          () => {
            updateArticle._execute({}, { articleId, data });
          },
          Meteor.Error,
          /api.articles.updateArticle.notPermitted/,
        );
      });
    });
  });
});
