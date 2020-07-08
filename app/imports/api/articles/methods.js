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
    data: Articles.schema.omit('createdAt', 'updatedAt', 'userId', 'slug'),
  }).validator({ clean: true }),

  run({ data }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.articles.createArticle.notLoggedIn', i18n.__('api.articles.mustBeLoggedIn'));
    }
    Meteor.users.update({ _id: this.userId }, { $inc: { articlesCount: 1 }, $set: { lastArticle: new Date() } });
    return Articles.insert({ ...data, userId: this.userId });
  },
});
export const removeArticle = new ValidatedMethod({
  name: 'articles.removeArticle',
  validate: new SimpleSchema({
    articleId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.articles.labels.id') },
  }).validator(),

  run({ articleId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.articles.removeArticle.notLoggedIn', i18n.__('api.articles.mustBeLoggedIn'));
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
    data: Articles.schema.omit('createdAt', 'updatedAt', 'userId', 'slug'),
  }).validator({ clean: true }),

  run({ data, articleId }) {
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
    Meteor.users.update({ _id: this.userId }, { $set: { lastArticle: new Date() } });
    return Articles.update({ _id: articleId }, { $set: { ...data, userId: this.userId } });
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

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createArticle, removeArticle, updateArticle, visitArticle], 'name');

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
