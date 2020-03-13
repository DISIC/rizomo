import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import { isActive, getLabel } from '../../utils';
import Services from '../../services/services';
import Groups from '../../groups/groups';
// initialize Meteor.users customizations
import AppRoles from '../users';
import { structures } from '../structures';

// users.findUsers: Returns users using pagination
//   filter: string to search for in username/firstname/lastname/emails (case insensitive search)
//   page: number of the page requested
//   pageSize: number of entries per page
//   sortColumn/sortOrder: sort entries on a specific field with given order (1/-1)
//   exclude: specify a groupId and role (users in this role for this group will be excluded)
export const findUsers = new ValidatedMethod({
  name: 'users.findUsers',
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
      allowedValues: ['_id', ...Meteor.users.schema.objectKeys()],
      defaultValue: 'username',
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
    exclude: {
      type: Object,
      optional: true,
    },
    'exclude.groupId': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.methods.labels.excludeGroupId'),
    },
    'exclude.role': {
      type: String,
      allowedValues: AppRoles,
      label: getLabel('api.methods.labels.excludeRole'),
    },
  }).validator({ clean: true }),
  run({
    page, pageSize, filter, sortColumn, sortOrder, exclude,
  }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    // calculate number of entries to skip
    const skip = (page - 1) * pageSize;
    let query = {};
    if (filter && filter.length > 0) {
      const emails = {
        $elemMatch: {
          address: { $regex: `.*${filter}.*`, $options: 'i' },
        },
      };
      query.$or = [
        { emails },
        {
          username: { $regex: `.*${filter}.*`, $options: 'i' },
        },
        {
          lastName: { $regex: `.*${filter}.*`, $options: 'i' },
        },
        {
          firstName: { $regex: `.*${filter}.*`, $options: 'i' },
        },
      ];
    }
    if (exclude) {
      const usersField = `${exclude.role}s`;
      const group = Groups.findOne(exclude.groupId);
      if (group && group[usersField].length > 0) {
        if (Object.keys(query).length > 0) {
          query = { $and: [{ _id: { $nin: group[usersField] } }, query] };
        } else {
          query = { _id: { $nin: group[usersField] } };
        }
      }
    }
    const sort = {};
    sort[sortColumn] = sortOrder;
    const totalCount = Meteor.users.find(query).count();
    const data = Meteor.users
      .find(query, {
        fields: isAdmin ? Meteor.users.adminFields : Meteor.users.publicFields,
        limit: pageSize,
        skip,
        sort,
      })
      .fetch();
    return { data, page, totalCount };
  },
});

export const setUsername = new ValidatedMethod({
  name: 'users.setUsername',
  validate: new SimpleSchema({
    username: { type: String, min: 1, label: getLabel('api.users.labels.username') },
  }).validator(),

  run({ username }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setUsername.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // will throw error if username already taken
    Accounts.setUsername(this.userId, username);
  },
});

export const setStructure = new ValidatedMethod({
  name: 'users.setStructure',
  validate: new SimpleSchema({
    structure: {
      type: String,
      allowedValues: structures,
      label: getLabel('api.users.labels.structure'),
    },
  }).validator(),

  run({ structure }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setStructure.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // will throw error if username already taken
    Meteor.users.update({ _id: this.userId }, { $set: { structure } });
  },
});

export const setAdmin = new ValidatedMethod({
  name: 'users.setAdmin',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin');
  },
});

export const setActive = new ValidatedMethod({
  name: 'users.setActive',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setActive.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setActive.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Meteor.users.update(userId, { $set: { isActive: true, isRequest: false } });
  },
});

export const unsetActive = new ValidatedMethod({
  name: 'users.unsetActive',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetActive.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetActive.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    Meteor.users.update(userId, { $set: { isActive: false } });
  },
});

export const unsetAdmin = new ValidatedMethod({
  name: 'users.unsetAdmin',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin');
  },
});

export const setAdminOf = new ValidatedMethod({
  name: 'users.setAdminOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin', groupId);
    // store info in group collection
    if (group.admins.indexOf(userId) === -1) {
      Groups.update(groupId, { $push: { admins: userId } });
    }
  },
});

export const unsetAdminOf = new ValidatedMethod({
  name: 'users.unsetAdminOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin', groupId);
    // update info in group collection
    if (group.admins.indexOf(userId) !== -1) {
      Groups.update(groupId, { $pull: { admins: userId } });
    }
  },
});

export const setAnimatorOf = new ValidatedMethod({
  name: 'users.setAnimatorOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setAnimatorOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAnimatorOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.setAnimatorOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'animator', groupId);
    // store info in group collection
    if (group.animators.indexOf(userId) === -1) {
      Groups.update(groupId, { $push: { animators: userId } });
    }
  },
});

export const unsetAnimatorOf = new ValidatedMethod({
  name: 'users.unsetAnimatorOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has admin rights on group (or global admin) or self removal
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'animator', groupId);
    // update info in group collection
    if (group.animators.indexOf(userId) !== -1) {
      Groups.update(groupId, { $pull: { animators: userId } });
    }
  },
});

export const setMemberOf = new ValidatedMethod({
  name: 'users.setMemberOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setMemberOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has sufficient rights on group
    let authorized = false;
    if (group.type === 0) {
      // open group, users cand set themselve as member
      authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    } else {
      authorized = Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    }
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.setMemberOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'member', groupId);
    // remove candidate Role if present
    if (Roles.userIsInRole(userId, 'candidate', groupId)) {
      Roles.removeUsersFromRoles(userId, 'candidate', groupId);
    }
    // store info in group collection
    if (group.members.indexOf(userId) === -1) {
      Groups.update(groupId, {
        $push: { members: userId },
        $pull: { candidates: userId },
      });
    }
  },
});

export const unsetMemberOf = new ValidatedMethod({
  name: 'users.unsetMemberOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has sufficient rights on group (or self remove)
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetMemberOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // add role to user collection
    Roles.removeUsersFromRoles(userId, 'member', groupId);
    // update info in group collection
    if (group.members.indexOf(userId) !== -1) {
      Groups.update(groupId, {
        $pull: { members: userId },
      });
    }
  },
});

export const setCandidateOf = new ValidatedMethod({
  name: 'users.setCandidateOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setCandidateOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // only manage candidates on moderated groups
    if (group.type !== 5) {
      throw new Meteor.Error('api.users.setCandidateOf.moderatedGroupOnly', i18n.__('api.groups.moderatedGroupOnly'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setCandidateOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // allow to set candidate for self or as admin/animator
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.setCandidateOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'candidate', groupId);
    // store info in group collection
    if (group.candidates.indexOf(userId) === -1) {
      Groups.update(groupId, {
        $push: { candidates: userId },
      });
    }
  },
});

export const unsetCandidateOf = new ValidatedMethod({
  name: 'users.unsetCandidateOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetCandidateOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetCandidateOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // allow to unset candidate for self or as admin/animator
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetCandidateOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'candidate', groupId);
    // remove info from group collection
    if (group.candidates.indexOf(userId) !== -1) {
      Groups.update(groupId, {
        $pull: { candidates: userId },
      });
    }
  },
});

export const favService = new ValidatedMethod({
  name: 'users.favService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run({ serviceId }) {
    // check service existence
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.users.favService.unknownService', i18n.__('api.services.unknownService'));
    }
    if (!this.userId) {
      throw new Meteor.Error('api.users.favService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // store service in user favorite services
    if (user.favServices.indexOf(serviceId) === -1) {
      Meteor.users.update(this.userId, {
        $push: { favServices: serviceId },
      });
    }
  },
});

export const unfavService = new ValidatedMethod({
  name: 'users.unfavService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run({ serviceId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.unfavService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove service from user favorite services
    if (user.favServices.indexOf(serviceId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favServices: serviceId },
      });
    }
  },
});

export const setLanguage = new ValidatedMethod({
  name: 'users.setLanguage',
  validate: new SimpleSchema({
    language: { type: String, label: getLabel('api.users.labels.language') },
  }).validator(),

  run({ language }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.setLanguage.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    Meteor.users.update(this.userId, {
      $set: { language },
    });
  },
});

// method to associate existing account with a Keycloak Id
export const setKeycloakId = new ValidatedMethod({
  name: 'users.setKeycloakId',
  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
      label: getLabel('api.users.labels.emailAddress'),
    },
    keycloakId: { type: String, label: getLabel('api.methods.labels.keycloakId') },
  }).validator(),

  run({ email, keycloakId }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setKeycloakId.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    const user = Accounts.findUserByEmail(email);
    if (user) {
      Meteor.users.update({ _id: user._id }, { $set: { services: { keycloak: { id: keycloakId } } } });
      return user._id;
    }
    throw new Meteor.Error('api.users.setKeycloakId.unknownUser', i18n.__('api.users.unknownUser'));
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    setUsername,
    setStructure,
    setActive,
    setAdminOf,
    unsetAdminOf,
    setAnimatorOf,
    unsetAnimatorOf,
    setMemberOf,
    unsetMemberOf,
    setCandidateOf,
    unsetCandidateOf,
    favService,
    unfavService,
    findUsers,
    setLanguage,
    setKeycloakId,
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
