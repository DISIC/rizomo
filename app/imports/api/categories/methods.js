import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../utils';
import Categories from './categories';

export const createCategorie = new ValidatedMethod({
  name: 'categories.createCategorie',
  validate: new SimpleSchema({
    name: { type: String, min: 1 },
  }).validator(),

  run({ name }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.categories.createCategorie.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Categories.insert({
      name,
    });
  },
});

export const removeCategorie = new ValidatedMethod({
  name: 'categories.removeCategorie',
  validate: new SimpleSchema({
    categorieId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ categorieId }) {
    // check categorie existence
    const categorie = Categories.findOne(categorieId);
    if (categorie === undefined) {
      throw new Meteor.Error(
        'api.categories.removeCategorie.unknownCategorie',
        i18n.__('api.categories.unknownCategorie'),
      );
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.categories.removeCategorie.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Categories.remove(categorieId);
  },
});

export const updateCategorie = new ValidatedMethod({
  name: 'categories.updateCategorie',
  validate: new SimpleSchema({
    categorieId: { type: String, regEx: SimpleSchema.RegEx.Id },
    data: Object,
    'data.name': { type: String, min: 1 },
  }).validator(),

  run({ categorieId, data }) {
    // check categorie existence
    const categorie = Categories.findOne({ _id: categorieId });
    if (categorie === undefined) {
      throw new Meteor.Error('api.categories.updateCategorie.unknownGroup', i18n.__('api.categories.unknownCategorie'));
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.categories.updateCategorie.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Categories.update({ _id: categorieId }, { $set: data });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createCategorie, removeCategorie, updateCategorie], 'name');

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
