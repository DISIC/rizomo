import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../utils';
import Groups from './groups';
import { addGroup, removeElement } from '../personalspaces/methods';
import kcClient from '../appclients/kcClient';
import nextClient from '../appclients/nextcloud';

export const favGroup = new ValidatedMethod({
  name: 'groups.favGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.favGroup.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check group existence
    const group = Groups.findOne(groupId);
    if (group === undefined) {
      throw new Meteor.Error('api.groups.favGroup.unknownService', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne(this.userId);
    // store group in user favorite groups
    if (user.favGroups === undefined) {
      Meteor.users.update(this.userId, {
        $set: { favGroups: [groupId] },
      });
    } else if (user.favGroups.indexOf(groupId) === -1) {
      Meteor.users.update(this.userId, {
        $push: { favGroups: groupId },
      });
    }
    // update user personalSpace
    addGroup._execute({ userId: this.userId }, { groupId });
  },
});

export const unfavGroup = new ValidatedMethod({
  name: 'groups.unfavGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.unfavGroup.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove group from user favorite groups
    if (user.favGroups.indexOf(groupId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favGroups: groupId },
      });
    }
    // update user personalSpace
    removeElement._execute({ userId: this.userId }, { type: 'group', elementId: groupId });
  },
});

function _createGroup({ name, type, content, description, nextcloud, userId }) {
  try {
    const groupId = Groups.insert({
      name,
      type,
      content,
      description,
      owner: userId,
      admins: [userId],
      active: true,
      nextcloud,
    });
    Roles.addUsersToRoles(userId, 'admin', groupId);
    favGroup._execute({ userId }, { groupId });
  } catch (error) {
    if (error.code === 11000) {
      throw new Meteor.Error('api.groups.createGroup.duplicateName', i18n.__('api.groups.groupAlreadyExist'));
    } else {
      throw error;
    }
  }
}

export const createGroup = new ValidatedMethod({
  name: 'groups.createGroup',
  validate: new SimpleSchema({
    name: { type: String, min: 1, label: getLabel('api.groups.labels.name') },
    type: { type: SimpleSchema.Integer, min: 0, label: getLabel('api.groups.labels.type') },
    description: { type: String, label: getLabel('api.groups.labels.description') },
    content: { type: String, label: getLabel('api.groups.labels.content') },
    nextcloud: { type: Boolean, defaultValue: false, label: getLabel('api.groups.labels.nextcloud') },
  }).validator({ clean: true }),

  run({ name, type, content, description, nextcloud }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.createGroup.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    if (kcClient) {
      // create associated groups and roles in keycloak
      kcClient.addGroup({ name }, this.userId);
    }
    if (nextcloud && nextClient) {
      // create associated group in Nextcloud
      return nextClient.addGroup(name).then((response) => {
        if (response === 'ok') {
          return nextClient.addGroupFolder(name, name).then((res) => {
            if (res === false)
              throw new Meteor.Error(
                'api.groups.createGroup.nextcloudError',
                i18n.__('api.nextcloud.addGroupFolderError'),
              );
            else return _createGroup({ name, type, content, description, nextcloud, userId: this.userId });
          });
        }
        const msg =
          response === 'group exists' ? i18n.__('api.nextcloud.groupExists') : i18n.__('api.nextcloud.addGroupError');
        throw new Meteor.Error('api.groups.createGroup.nextcloudError', msg);
      });
    }
    return _createGroup({ name, type, content, description, nextcloud, userId: this.userId });
  },
});

export const removeGroup = new ValidatedMethod({
  name: 'groups.removeGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId }) {
    // check group existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.groups.removeGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    // FIXME : allow only for owner or for all admins ?
    const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    const authorized = isAdmin || this.userId === group.owner;
    if (!authorized) {
      throw new Meteor.Error('api.groups.removeGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    if (kcClient) {
      // delete associated groups and roles in keycloak
      kcClient.removeGroup(group, this.userId);
    }
    // remove all roles set on this group
    Roles.removeScope(groupId);
    Groups.remove(groupId);
    // remove from users favorite groups
    Meteor.users.update({ favGroups: { $all: [groupId] } }, { $pull: { favGroups: groupId } }, { multi: true });
    if (nextClient && group.nextcloud) {
      // remove group from nextcloud if it exists
      return nextClient.groupExists(group.name).then((resExists) => {
        if (resExists) {
          return nextClient.removeGroupFolder(group.name).then((response) => {
            if (response)
              return nextClient.removeGroup(group.name).then((res) => {
                if (res === false)
                  throw new Meteor.Error(
                    'api.groups.removeGroup.nextcloudError',
                    i18n.__('api.nextcloud.removeGroupError'),
                  );
              });
            throw new Meteor.Error(
              'api.groups.removeGroup.nextcloudError',
              i18n.__('api.nextcloud.removeGroupFolderError'),
            );
          });
        }
        return null;
      });
    }
    return null;
  },
});

function _updateGroup(groupId, groupData) {
  try {
    Groups.update({ _id: groupId }, { $set: groupData });
  } catch (error) {
    if (error.code === 11000) {
      throw new Meteor.Error('api.groups.updateGroup.duplicateName', i18n.__('api.groups.groupAlreadyExist'));
    } else {
      throw error;
    }
  }
}

export const updateGroup = new ValidatedMethod({
  name: 'groups.updateGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
    data: Object,
    'data.name': {
      type: String,
      min: 1,
      optional: true,
      label: getLabel('api.groups.labels.name'),
    },
    'data.type': {
      type: SimpleSchema.Integer,
      allowedValues: [0, 5, 10],
      optional: true,
      label: getLabel('api.groups.labels.type'),
    },
    'data.description': { type: String, optional: true, label: getLabel('api.groups.labels.description') },
    'data.content': { type: String, optional: true, label: getLabel('api.groups.labels.content') },
    'data.active': { type: Boolean, optional: true, label: getLabel('api.groups.labels.active') },
    'data.groupPadId': { type: String, optional: true, label: getLabel('api.groups.labels.groupPadId') },
    'data.digest': { type: String, optional: true, label: getLabel('api.groups.labels.digest') },
    'data.nextcloud': { type: Boolean, optional: true, label: getLabel('api.groups.labels.nextcloud') },
  }).validator({ clean: true }),

  run({ groupId, data }) {
    // check group existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.groups.updateGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    const isAllowed = isActive(this.userId) && Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    const authorized = isAllowed || this.userId === group.owner;
    if (!authorized) {
      throw new Meteor.Error('api.groups.updateGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    let groupData = {};
    if (!Roles.userIsInRole(this.userId, 'admin', groupId)) {
      // animator can only update description and content
      if (data.description) groupData.description = data.description;
      if (data.content) groupData.content = data.content;
    } else {
      groupData = { ...data };
    }
    // update group in keycloak if name has changed
    if (kcClient && groupData.name && groupData.name !== group.name) {
      kcClient.updateGroup(group.name, groupData.name, this.userId);
    }
    // create nextcloud group if needed
    const nextRequired = data.nextcloud === true || (data.nextcloud === undefined && group.nextcloud === true);
    if (nextClient && nextRequired) {
      const groupName = groupData.name || group.name;
      return nextClient.groupExists(groupName).then((resExists) => {
        if (resExists === false) {
          return nextClient.addGroup(groupName).then((response) => {
            if (response === 'ok') {
              return nextClient.addGroupFolder(groupName, groupName).then((res) => {
                if (res === false)
                  throw new Meteor.Error(
                    'api.groups.updateGroup.nextcloudError',
                    i18n.__('api.nextcloud.addGroupFolderError'),
                  );
                _updateGroup(groupId, groupData);
              });
            }
            const msg =
              response === 'group exists'
                ? i18n.__('api.nextcloud.groupExists')
                : i18n.__('api.nextcloud.addGroupError');
            throw new Meteor.Error('api.groups.updateGroup.nextcloudError', msg);
          });
        }
        return _updateGroup(groupId, groupData);
      });
    }
    return _updateGroup(groupId, groupData);
  },
});

// groups.findGroups: Returns groups using pagination
//   filter: string to search for in name or description (case insensitive search)
//   page: number of the page requested
//   pageSize: number of entries per page
//   sortColumn/sortOrder: sort entries on a specific field with given order (1/-1)
export const findGroups = new ValidatedMethod({
  name: 'groups.findGroups',
  validate: new SimpleSchema({
    page: {
      type: SimpleSchema.Integer,
      min: 1,
      defaultValue: 1,
      optional: true,
      label: getLabel('api.methods.labels.page'),
    },
    pageSize: {
      type: SimpleSchema.Integer,
      min: 1,
      defaultValue: 10,
      optional: true,
      label: getLabel('api.methods.labels.pageSize'),
    },
    filter: {
      type: String,
      defaultValue: '',
      optional: true,
      label: getLabel('api.methods.labels.filter'),
    },
    sortColumn: {
      type: String,
      allowedValues: ['_id', ...Groups.schema.objectKeys()],
      defaultValue: 'name',
      optional: true,
      label: getLabel('api.methods.labels.sortColumn'),
    },
    sortOrder: {
      type: SimpleSchema.Integer,
      allowedValues: [1, -1],
      defaultValue: 1,
      optional: true,
      label: getLabel('api.methods.labels.sortOrder'),
    },
  }).validator({ clean: true }),
  run({ page, pageSize, filter, sortColumn, sortOrder }) {
    // calculate number of entries to skip
    const skip = (page - 1) * pageSize;
    let query = {};
    if (filter && filter.length > 0) {
      query = {
        $or: [
          {
            name: { $regex: `.*${filter}.*`, $options: 'i' },
          },
          {
            description: { $regex: `.*${filter}.*`, $options: 'i' },
          },
        ],
      };
    }
    const sort = {};
    sort[sortColumn] = sortOrder;
    const totalCount = Groups.find(query).count();
    const data = Groups.find(query, {
      fields: Groups.publicFields,
      limit: pageSize,
      skip,
      sort,
    }).fetch();
    return { data, page, totalCount };
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([favGroup, unfavGroup, createGroup, removeGroup, updateGroup, findGroups], 'name');

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
