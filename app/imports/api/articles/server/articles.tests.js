/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';

import {
  createArticle,
  removeArticle,
  updateArticle,
  visitArticle,
  downloadBackupPublications,
  uploadBackupPublications,
} from '../methods';
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
      _.times(3, () => {
        Factory.create('article', { userId });
      });
      _.times(1, () => {
        Factory.create('article', { userId, title: 'coucou' });
      });
      _.times(2, () => {
        Factory.create('article', { userId: Random.id() });
      });
    });
    describe('articles.all', function () {
      it('sends all articles', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.all', { userId, page: 1, search: '', itemPerPage: 10 }, (collections) => {
          assert.equal(collections.articles.length, 4);
          done();
        });
        const nbArticles = Meteor.call('get_articles.all_count', { userId });
        assert.equal(nbArticles, 4);
      });
      it('sends all articles with pagination', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.all', { userId, page: 2, search: '', itemPerPage: 2 }, (collections) => {
          assert.equal(collections.articles.length, 2);
          done();
        });
      });
      it('sends all articles with search', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.all', { userId, page: 1, search: 'coucou', itemPerPage: 10 }, (collections) => {
          assert.equal(collections.articles.length, 1);
          done();
        });
      });
    });
    describe('articles.one', function () {
      it('sends one article', function (done) {
        const artFound = Articles.findOne({ userId, title: 'coucou' });
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.one', { slug: artFound.slug }, (collections) => {
          assert.equal(collections.articles.length, 1);
          const art = collections.articles[0];
          assert.typeOf(art, 'object');
          assert.equal(art.title, 'coucou');
          done();
        });
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
      Articles.remove({});
      articleData = {
        title: 'Chat sur un nuage de licorne',
        description: "Chevaucher un dragon rose à pois. C'est en fait une fée pour piéger Peter Pan",
        content: "<div>c'est un article de fou</div>",
      };
      articleId = Factory.create('article', { userId })._id;
      _.times(3, () => {
        Factory.create('article', { userId });
      });
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
    describe('visitArticle', function () {
      it('does visit an article incrementing visits', function () {
        let article = Articles.findOne(articleId);
        assert.equal(article.visits, 0);
        visitArticle._execute({}, { articleId });
        article = Articles.findOne(articleId);
        assert.equal(article.visits, 1);
      });
      it('does not increment visits on undefined article', function () {
        assert.throws(
          () => {
            visitArticle._execute({}, { articleId: Random.id() });
          },
          Meteor.Error,
          /api.articles.visitArticle.unknownArticle/,
        );
      });
    });
    describe('downloadBackupPublications', function () {
      it('does send all articles', function () {
        const allart = downloadBackupPublications._execute({ userId });
        assert.typeOf(allart, 'array');
        assert.lengthOf(allart, 4);
      });
      it('does not send all articles if not logged in', function () {
        assert.throws(
          () => {
            downloadBackupPublications._execute({});
          },
          Meteor.Error,
          /api.articles.downloadBackupPublications.notLoggedIn/,
        );
      });
    });
    describe('uploadBackupPublications', function () {
      const articles = [
        {
          title: 'Chat sur un nuage de licorne',
          description: "Chevaucher un dragon rose à pois. C'est en fait une fée pour piéger Peter Pan",
          content: "<div>c'est un article de fou</div>",
        },
        {
          title: 'Chat sur MIMOSA',
          description: 'article modifié',
          content: "<div>c'est toujours un article de fou</div>",
        },
      ];
      it('does upload articles from table', function () {
        Articles.remove({});
        assert.equal(Articles.find({ userId }).count(), 0);
        uploadBackupPublications._execute({ userId }, { articles });
        assert.equal(Articles.find({ userId }).count(), 2);
      });
      it('does reupload downloaded articles', function () {
        const downart = downloadBackupPublications._execute({ userId });
        assert.typeOf(downart, 'array');
        assert.lengthOf(downart, 4);
        Articles.remove({});
        assert.equal(Articles.find({ userId }).count(), 0);
        uploadBackupPublications._execute({ userId }, { articles: downart });
        assert.equal(Articles.find({ userId }).count(), 4);
      });
      it('does not upload articles if not logged in', function () {
        assert.throws(
          () => {
            uploadBackupPublications._execute({}, { articles });
          },
          Meteor.Error,
          /api.articles.uploadBackupPublications.notLoggedIn/,
        );
      });
    });
  });
});
