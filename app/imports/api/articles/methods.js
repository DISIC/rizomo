import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../utils';
import Articles from './articles';

export const createArticle = new ValidatedMethod({
  name: 'articles.createArticle',
  validate: new SimpleSchema({
    data: Articles.schema.omit('createdAt', 'updatedAt', 'userId', 'slug', 'structure'),
  }).validator({ clean: true }),

  run({ data }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.articles.createArticle.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    Meteor.users.update({ _id: this.userId }, { $inc: { articlesCount: 1 }, $set: { lastArticle: new Date() } });
    const structure = Meteor.users.findOne(this.userId, { fields: { structure: 1 } }).structure || '';
    return Articles.insert({ ...data, userId: this.userId, structure });
  },
});
export const removeArticle = new ValidatedMethod({
  name: 'articles.removeArticle',
  validate: new SimpleSchema({
    articleId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.articles.labels.id') },
  }).validator(),

  run({ articleId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.articles.removeArticle.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    const article = Articles.findOne({ _id: articleId });
    const authorized = this.userId === article.userId;
    if (!authorized) {
      throw new Meteor.Error('api.articles.removeArticle.notPermitted', i18n.__('api.articles.adminArticleNeeded'));
    }
    Meteor.users.update({ _id: this.userId }, { $inc: { articlesCount: -1 } });
    return Articles.remove(articleId);
  },
});

export const updateArticle = new ValidatedMethod({
  name: 'articles.updateArticle',
  validate: new SimpleSchema({
    articleId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.articles.labels.id') },
    data: Articles.schema.omit('createdAt', 'updatedAt', 'userId', 'slug', 'structure'),
    updateStructure: { type: Boolean, defaultValue: false },
  }).validator({ clean: true }),

  run({ data, articleId, updateStructure }) {
    // check article existence
    const article = Articles.findOne({ _id: articleId });
    if (article === undefined) {
      throw new Meteor.Error('api.articles.updateArticle.unknownArticle', i18n.__('api.articles.unknownArticle'));
    }
    // check if current user has admin rights on article
    const authorized = isActive(this.userId) || this.userId === article.userId;
    if (!authorized) {
      throw new Meteor.Error('api.articles.updateArticle.notPermitted', i18n.__('api.articles.adminArticleNeeded'));
    }
    const userStructure = Meteor.users.findOne(this.userId, { fields: { structure: 1 } }).structure || '';
    Meteor.users.update({ _id: this.userId }, { $set: { lastArticle: new Date() } });
    const updateData = { ...data, userId: this.userId };
    if (updateStructure) updateData.structure = userStructure;
    return Articles.update({ _id: articleId }, { $set: updateData });
  },
});

export const visitArticle = new ValidatedMethod({
  name: 'articles.visitArticle',
  validate: new SimpleSchema({
    articleId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.articles.labels.id') },
  }).validator(),

  run({ articleId }) {
    // check article existence
    const article = Articles.findOne({ _id: articleId });
    if (article === undefined) {
      throw new Meteor.Error('api.articles.visitArticle.unknownArticle', i18n.__('api.articles.unknownArticle'));
    }
    return Articles.update({ _id: articleId }, { $inc: { visits: 1 } });
  },
});

export const downloadBackupPublications = new ValidatedMethod({
  name: 'articles.downloadBackupPublications',
  validate: null,
  run() {
    const authorized = isActive(this.userId);
    if (!authorized) {
      throw new Meteor.Error(
        'api.articles.downloadBackupPublications.notLoggedIn',
        i18n.__('api.users.mustBeLoggedIn'),
      );
    }
    return Articles.find(
      { userId: this.userId },
      { fields: { userId: 0, visits: 0, _id: 0, createdAt: 0, updatedAt: 0, slug: 0 } },
    ).fetch();
  },
});

export const uploadBackupPublications = new ValidatedMethod({
  name: 'articles.uploadBackupPublications',
  validate: new SimpleSchema({
    articles: { type: Array },
    'articles.$': Articles.schema.omit('userId', 'visits', '_id', 'createdAt', 'updatedAt', 'slug'),
    // if updateStructure is true, all articles will be attached to user's current structure
    updateStructure: { type: Boolean, defaultValue: false },
  }).validator({ clean: true }),

  run({ articles, updateStructure }) {
    try {
      const authorized = isActive(this.userId);
      if (!authorized) {
        throw new Meteor.Error(
          'api.articles.uploadBackupPublications.notLoggedIn',
          i18n.__('api.users.mustBeLoggedIn'),
        );
      }
      const userStructure = Meteor.users.findOne(this.userId, { fields: { structure: 1 } }).structure || '';
      return articles.map((article) =>
        Articles.insert({
          ...article,
          userId: this.userId,
          structure: updateStructure ? userStructure : article.structure,
        }),
      );
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const checkSelectedInPublications = new ValidatedMethod({
  name: 'articles.checkSelectedInPublications',
  validate: new SimpleSchema({
    path: { type: String },
  }).validator({ clean: true }),

  run({ path }) {
    const regex = { $regex: new RegExp(path, 'i') };
    return Articles.findOne({ userId: this.userId, content: regex });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    createArticle,
    removeArticle,
    updateArticle,
    visitArticle,
    uploadBackupPublications,
    downloadBackupPublications,
    checkSelectedInPublications,
  ],
  'name',
);

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
