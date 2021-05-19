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
    sortColumn: {
      type: String,
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
    groupId: {
      type: String,
      optional: true,
    },
  }).validator({ clean: true }),
  run({ page, pageSize, sortColumn, sortOrder, groupId }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    const user = Meteor.users.findOne({ _id: this.userId });
    // calculate number of entries to skip
    const skip = (page - 1) * pageSize;
    const myGroups = user.favGroups;
    const sort = {};
    sort[sortColumn] = sortOrder;
    const totalCount = Groups.find({ _id: { $in: myGroups, $ne: groupId } }).count();
    const data = Groups.find(
      { _id: { $in: myGroups, $ne: groupId } },
      {
        fields: isAdmin ? Groups.adminFields : Groups.publicFields,
        limit: pageSize,
        skip,
        sort,
      },
    ).fetch();
    return { data, page, totalCount };
  },
});

export const addGroupMembersToGroup = new ValidatedMethod({
  name: 'groups.addGroupMembersToGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
    otherGroupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId, otherGroupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    const group2 = Groups.findOne({ _id: otherGroupId });
    if (group === undefined || group2 === undefined) {
      throw new Meteor.Error('api.groups.addGroupMemberToGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized =
      (isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId)) ||
      (this.userId === group.owner && this.userId === group2.owner);
    if (!authorized) {
      throw new Meteor.Error('api.groups.addGroupMemberToGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }

    const usersGroup = group2.members;

    let nb = 0;
    let i;
    for (i = 0; i < usersGroup.length; i += 1) {
      // add role to user collection
      if (!Roles.userIsInRole(usersGroup[i], 'member', groupId)) {
        Roles.addUsersToRoles(usersGroup[i], 'member', groupId);
        // remove candidate Role if present
        if (Roles.userIsInRole(usersGroup[i], 'candidate', groupId)) {
          Roles.removeUsersFromRoles(usersGroup[i], 'candidate', groupId);
        }
        // store info in group collection
        if (group.members.indexOf(usersGroup[i]) === -1) {
          Groups.update(groupId, {
            $push: { members: usersGroup[i] },
            $pull: { candidates: usersGroup[i] },
          });
        }
        // update user personalSpace
        favGroup._execute({ userId: usersGroup[nb] }, { groupId });
        nb += 1;
      }
    }
    return nb;
  },
});

function _createGroup({ name, type, content, description, avatar, plugins, userId }) {
  try {
    const user = Meteor.users.findOne(userId);
    if (user.groupCount < user.groupQuota) {
      const groupId = Groups.insert({
        name,
        type,
        content,
        description,
        avatar,
        owner: userId,
        animators: [userId],
        admins: [userId],
        active: true,
        plugins,
      });
      Roles.addUsersToRoles(userId, ['admin', 'animator'], groupId);

      favGroup._execute({ userId }, { groupId });

      user.groupCount += 1;
      Meteor.users.update(userId, {
        $set: { groupCount: user.groupCount },
      });

      // move group temp avatar from user minio to group minio and update avatar link
      if (avatar !== '' && avatar.includes('groupAvatar.png')) {
        Meteor.call('files.move', {
          sourcePath: `users/${userId}`,
          destinationPath: `groups/${groupId}`,
          files: ['groupAvatar.png'],
        });

        const { minioSSL, minioEndPoint, minioBucket, minioPort } = Meteor.settings.public;
        const avatarLink = `http${minioSSL ? 's' : ''}://${minioEndPoint}${
          minioPort ? `:${minioPort}` : ''
        }/${minioBucket}/groups/${groupId}/groupAvatar.png?${new Date().getTime()}`;

        Groups.update({ _id: groupId }, { $set: { avatar: avatarLink } });
      }
    } else {
      throw new Meteor.Error('api.groups.createGroup.toManyGroup', i18n.__('api.groups.toManyGroup'));
    }
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
    content: { type: String, defaultValue: '', label: getLabel('api.groups.labels.content') },
    avatar: { type: String, defaultValue: '', label: getLabel('api.groups.labels.avatar') },
    plugins: { type: Object, optional: true, blackbox: true, label: getLabel('api.groups.labels.plugins') },
  }).validator({ clean: true }),

  run({ name, type, content, description, avatar, plugins }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.createGroup.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    return _createGroup({ name, type, content, description, plugins, avatar, userId: this.userId });
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

    // Update group quota for owner
    const owner = Meteor.users.findOne({ _id: group.owner });
    if (owner !== undefined) {
      owner.groupCount -= 1;
      if (owner.groupCount <= 0) {
        owner.groupCount = 0;
      }
      Meteor.users.update(group.owner, {
        $set: { groupCount: owner.groupCount },
      });
    }

    // remove all roles set on this group
    Roles.removeScope(groupId);
    Groups.remove(groupId);
    // remove from users favorite groups
    Meteor.users.update({ favGroups: { $all: [groupId] } }, { $pull: { favGroups: groupId } }, { multi: true });
    return null;
  },
});

function _updateGroup(groupId, groupData, oldGroup) {
  try {
    Groups.update({ _id: groupId }, { $set: groupData });
    // return both old and new data to allow plugins to detect changes in 'after' hook
    return [groupData, oldGroup];
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
    'data.avatar': { type: String, optional: true, label: getLabel('api.groups.labels.avatar') },
    'data.active': { type: Boolean, optional: true, label: getLabel('api.groups.labels.active') },
    'data.groupPadId': { type: String, optional: true, label: getLabel('api.groups.labels.groupPadId') },
    'data.digest': { type: String, optional: true, label: getLabel('api.groups.labels.digest') },
    'data.plugins': { type: Object, optional: true, blackbox: true, label: getLabel('api.groups.labels.plugins') },
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
      if (data.avatar) groupData.avatar = data.avatar;
    } else {
      groupData = { ...data };
    }
    return _updateGroup(groupId, groupData, group);
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck([favGroup, unfavGroup, createGroup, removeGroup, updateGroup], 'name');
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
