import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../utils';
import PersonalSpaces from './personalspaces';
import Groups from '../groups/groups';
import Services from '../services/services';

const addItem = (userId, item) => {
  const currentPersonalSpace = PersonalSpaces.findOne({ userId });
  let alreadyExists = false;
  if (currentPersonalSpace === undefined) {
    // create personalSpace if not existing
    PersonalSpaces.insert({ userId, unsorted: [], sorted: [] });
  } else {
    // check that item is not already present
    alreadyExists = PersonalSpaces.findOne({
      $and: [
        { userId },
        {
          $or: [
            {
              unsorted: { $elemMatch: { type: item.type, element_id: item.element_id } },
            },
            { 'sorted.elements': { $elemMatch: { type: item.type, element_id: item.element_id } } },
          ],
        },
      ],
    }) !== undefined;
  }
  if (!alreadyExists) PersonalSpaces.update({ userId }, { $push: { unsorted: item } });
};

export const removeElement = new ValidatedMethod({
  name: 'personalspaces.removeElement',
  validate: new SimpleSchema({
    elementId: { type: String, regEx: SimpleSchema.RegEx.Id },
    type: String,
  }).validator(),

  run({ elementId, type }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.addService.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // remove all entries matching item type and element_id
    PersonalSpaces.update(
      { userId: this.userId },
      {
        $pull: {
          unsorted: { type, element_id: elementId },
          'sorted.$[].elements': { type, element_id: elementId },
        },
      },
    );
  },
});

export const addService = new ValidatedMethod({
  name: 'personalspaces.addService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ serviceId }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.addService.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.personalspaces.addService.unknownService', i18n.__('api.services.unknownService'));
    }
    addItem(this.userId, { type: 'service', element_id: serviceId });
  },
});

export const addGroup = new ValidatedMethod({
  name: 'personalspaces.addGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ groupId }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.addGroup.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const group = Groups.findOne(groupId);
    if (group === undefined) {
      throw new Meteor.Error('api.personalspaces.addGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    addItem(this.userId, { type: 'group', element_id: groupId });
  },
});

export const updatePersonalSpace = new ValidatedMethod({
  name: 'personalspaces.updatePersonalSpace',
  validate: new SimpleSchema({
    data: PersonalSpaces.schema.omit('userId'),
  }).validator({ clean: true }),

  run({ data }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.updatePersonalSpace.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const currentPersonalSpace = PersonalSpaces.findOne({ userId: this.userId });
    if (currentPersonalSpace === undefined) {
      // create personalSpace if not existing
      PersonalSpaces.insert({ ...data, userId: this.userId });
    } else {
      PersonalSpaces.update({ _id: currentPersonalSpace._id }, { $set: data });
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([updatePersonalSpace, removeElement, addService, addGroup], 'name');

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
