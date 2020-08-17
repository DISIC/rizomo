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
import logServer from '../logging';

const addItem = (userId, item) => {
  const currentPersonalSpace = PersonalSpaces.findOne({ userId });
  let alreadyExists = false;
  if (currentPersonalSpace === undefined) {
    // create personalSpace if not existing
    PersonalSpaces.insert({ userId, unsorted: [], sorted: [] });
  } else {
    // check that item is not already present
    alreadyExists =
      PersonalSpaces.findOne({
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

export const checkPersonalSpace = new ValidatedMethod({
  name: 'personalspaces.checkPersonalSpace',
  validate: null,

  run() {
    // check integrity of personal space datas (no duplicate card and check if groups still exists)

    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.updatePersonalSpace.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const currentPersonalSpace = PersonalSpaces.findOne({ userId: this.userId });
    if (currentPersonalSpace === undefined) {
      const u = Meteor.users.findOne({ _id: this.userId }, { fields: { username: 1, favServices: 1, favGroups: 1 } });
      logServer(`Regen personalspaces for ${u.username}...`);
      const unsorted = [];
      u.favServices.forEach((s) => {
        unsorted.push({
          element_id: s,
          type: 'service',
        });
      });
      u.favGroups.forEach((g) => {
        unsorted.push({
          element_id: g,
          type: 'group',
        });
      });
      updatePersonalSpace._execute({ userId: this.userId }, { data: { userId: this.userId, unsorted, sorted: [] } });
      return; // No need to go further
    }
    let changeMade = false;
    const elementIds = [];

    const checkZone = (zone) => {
      // Loop zone elements backward so we can delete items by index
      for (let index = zone.length - 1; index >= 0; index -= 1) {
        const elem = zone[index];
        if (elementIds.indexOf(elem.element_id) !== -1) {
          // We have a duplicate card to delete
          logServer(
            `Remove personalspace duplicate ${elem.type} for ${
              Meteor.users.findOne({ _id: this.userId }, { fields: { username: 1 } }).username
            }...`,
          );
          zone.splice(index, 1);
          changeMade = true;
          // eslint-disable-next-line
          continue; // continue to next element
        }
        if (elem.type === 'group') {
          // Check if group still exists
          const group = Groups.findOne(elem.element_id);
          if (group === undefined) {
            // group no more exists so delete element
            logServer(
              `Remove personalspace no more existing group for ${
                Meteor.users.findOne({ _id: this.userId }, { fields: { username: 1 } }).username
              }...`,
            );
            zone.splice(index, 1);
            changeMade = true;
            // eslint-disable-next-line
            continue; // continue to next element
          }
        }
        elementIds.push(elem.element_id);
      }
    };

    currentPersonalSpace.sorted.forEach((zone) => {
      checkZone(zone.elements);
    });
    checkZone(currentPersonalSpace.unsorted);

    // Save modified PS if necessary
    if (changeMade) {
      Meteor.call('personalspaces.updatePersonalSpace', { data: currentPersonalSpace }, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([updatePersonalSpace, removeElement, addService, addGroup, checkPersonalSpace], 'name');

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
