import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import { isActive, getLabel } from '../../utils';
import Groups from '../../groups/groups';
// initialize Meteor.users customizations
import AppRoles from '../users';
import { structures } from '../structures';
import { favGroup, unfavGroup } from '../../groups/methods';
import PersonalSpaces from '../../personalspaces/personalspaces';
import { createRoleNotification, createRequestNotification } from '../../notifications/server/notifsutils';
import logServer from '../../logging';
import { getRandomNCloudURL } from '../../nextcloud/methods';

if (Meteor.settings.public.enableKeycloak === true) {
  const { whiteDomains } = Meteor.settings.private;
  if (whiteDomains.length > 0) {
    logServer(i18n.__('api.users.logWhiteDomains', { domains: JSON.stringify(whiteDomains) }));
  }
}
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
  run({ page, pageSize, filter, sortColumn, sortOrder, exclude }) {
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
    let data;
    let totalCount;
    try {
      totalCount = Meteor.users.find(query).count();
      data = Meteor.users
        .find(query, {
          fields: isAdmin ? Meteor.users.adminFields : Meteor.users.publicFields,
          limit: pageSize,
          skip,
          sort,
        })
        .fetch();
    } catch {
      totalCount = 0;
      data = [];
    }
    return { data, page, totalCount };
  },
});

export const removeUser = new ValidatedMethod({
  name: 'users.removeUser',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights or self removal
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || userId === this.userId);
    if (!authorized) {
      throw new Meteor.Error('api.users.removeUser.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.removeUser.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // delete role assignements and remove from groups
    const groups = Roles.getScopesForUser(userId);
    groups.forEach((groupId) => {
      Groups.update(
        { _id: groupId },
        {
          $pull: {
            admins: userId,
            members: userId,
            animators: userId,
            candidates: userId,
          },
        },
      );
    });
    Meteor.roleAssignment.remove({ 'user._id': userId });
    PersonalSpaces.remove({ userId });
    Meteor.users.remove({ _id: userId });
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
    if (Meteor.settings.public.enableKeycloak) {
      // do not allow if keycloak mode is active
      throw new Meteor.Error('api.users.setUsername.disabled', i18n.__('api.users.managedByKeycloak'));
    }
    // will throw error if username already taken
    Accounts.setUsername(this.userId, username);
  },
});

export const checkUsername = new ValidatedMethod({
  name: 'users.checkUsername',
  validate: new SimpleSchema({
    username: { type: String, min: 1, label: getLabel('api.users.labels.username') },
  }).validator(),

  run({ username }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setUsername.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // return false if another user as an email or username matching username
    let user = Accounts.findUserByUsername(username, { fields: { _id: 1 } });
    if (user && user._id !== this.userId) return false;
    user = Accounts.findUserByEmail(username, { fields: { _id: 1 } });
    if (user && user._id !== this.userId) return false;
    return true;
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
    // check if user has structure admin role and remove it only if new structure and old structure are different
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user.structure !== structure) {
      if (Roles.userIsInRole(this.userId, 'adminStructure', user.structure)) {
        Roles.removeUsersFromRoles(this.userId, 'adminStructure', user.structure);
      }
    }
    // will throw error if username already taken
    Meteor.users.update({ _id: this.userId }, { $set: { structure } });
  },
});

export const setNcloudUrlAll = new ValidatedMethod({
  name: 'users.setNCloudAll',
  validate: new SimpleSchema().validator(),

  run() {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setNcloudUrlAll.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }

    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setNcloudUrlAll.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    const users = Meteor.users.find({ nclocator: '' }).fetch();

    let cpt = 0;

    for (let i = 0; i < users.length; i += 1) {
      users[i].nclocator = getRandomNCloudURL();
      Meteor.users.update({ _id: users[i]._id }, { $set: { nclocator: users[i].nclocator } });
      cpt += 1;
    }

    return cpt;
  },
});

export const setName = new ValidatedMethod({
  name: 'users.setName',
  validate: new SimpleSchema({
    firstName: {
      type: String,
      min: 1,
      label: getLabel('api.users.labels.firstName'),
      optional: true,
    },
    lastName: {
      type: String,
      min: 1,
      label: getLabel('api.users.labels.lastName'),
      optional: true,
    },
  }).validator(),

  run(data) {
    if (Meteor.settings.public.enableKeycloak === true) {
      throw new Meteor.Error('api.user.setName.disabled', i18n.__('api.users.managedByKeycloak'));
    }
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setName.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    if (Object.keys(data).length !== 0) Meteor.users.update({ _id: this.userId }, { $set: data });
  },
});

export const setEmail = new ValidatedMethod({
  name: 'users.setEmail',
  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
      label: getLabel('api.users.labels.emailAddress'),
      optional: true,
    },
  }).validator(),

  run({ email }) {
    if (Meteor.settings.public.enableKeycloak === true) {
      throw new Meteor.Error('api.user.setEmail.disabled', i18n.__('api.users.managedByKeycloak'));
    }
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setEmail.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    const oldEmail = Meteor.users.findOne(this.userId).emails[0].address;
    Accounts.addEmail(this.userId, email);
    Accounts.removeEmail(this.userId, oldEmail);
    // FIXME: new address should be verified (send verificationEmail)
  },
});

export const setAdmin = new ValidatedMethod({
  name: 'users.setAdmin',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin');
  },
});

export const setAdminStructure = new ValidatedMethod({
  name: 'users.setAdminStructure',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdminStructure.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'adminStructure', user.structure));
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdminStructure.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'adminStructure', user.structure);
  },
});

export const setActive = new ValidatedMethod({
  name: 'users.setActive',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setActive.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setActive.unknownUser', i18n.__('api.users.unknownUser'));
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
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetActive.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetActive.unknownUser', i18n.__('api.users.unknownUser'));
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
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check that user is not the only existing admin
    const admins = Roles.getUsersInRole('admin').fetch();
    if (admins.length === 1) {
      throw new Meteor.Error('api.users.unsetAdmin.lastAdmin', i18n.__('api.users.lastAdminError'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin');
  },
});

export const unsetAdminStructure = new ValidatedMethod({
  name: 'users.unsetAdminStructure',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetAdminStructure.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const authorized =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'adminStructure', user.structure));
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdminStructure.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'adminStructure', user.structure);
  },
});

export const setAdminOf = new ValidatedMethod({
  name: 'users.setAdminOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin', groupId);
    // store info in group collection
    if (group.admins.indexOf(userId) === -1) {
      Groups.update(groupId, { $push: { admins: userId } });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'admin', true);
  },
});

export const unsetAdminOf = new ValidatedMethod({
  name: 'users.unsetAdminOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.admins.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin', groupId);
    // update info in group collection
    if (group.admins.indexOf(userId) !== -1) {
      Groups.update(groupId, { $pull: { admins: userId } });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['animator', 'member', 'candidate'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'admin', false);
  },
});

export const setAnimatorOf = new ValidatedMethod({
  name: 'users.setAnimatorOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.setAnimatorOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setAnimatorOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAnimatorOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'animator', groupId);
    // store info in group collection
    if (group.animators.indexOf(userId) === -1) {
      Groups.update(groupId, { $push: { animators: userId } });
    }
    // update user personalSpace
    favGroup._execute({ userId }, { groupId });
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'animator', true);
  },
});

export const unsetAnimatorOf = new ValidatedMethod({
  name: 'users.unsetAnimatorOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin) or self removal
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.animators.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'animator', groupId);
    // update info in group collection
    if (group.animators.indexOf(userId) !== -1) {
      Groups.update(groupId, { $pull: { animators: userId } });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['member', 'admin', 'candidate'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'animator', false);
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
    // update user personalSpace
    favGroup._execute({ userId }, { groupId });
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'member', true);
  },
});

export const unsetMemberOf = new ValidatedMethod({
  name: 'users.unsetMemberOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has sufficient rights on group (or self remove)
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetMemberOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.members.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.removeUsersFromRoles(userId, 'member', groupId);
    // update info in group collection
    if (group.members.indexOf(userId) !== -1) {
      Groups.update(groupId, {
        $pull: { members: userId },
      });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['animator', 'admin', 'candidate'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'member', false);
  },
});

export const setCandidateOf = new ValidatedMethod({
  name: 'users.setCandidateOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // allow to set candidate for self or as admin/animator
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.setCandidateOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
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
    // add role to user collection
    Roles.addUsersToRoles(userId, 'candidate', groupId);
    // store info in group collection
    if (group.candidates.indexOf(userId) === -1) {
      Groups.update(groupId, {
        $push: { candidates: userId },
      });
    }
    // update user personalSpace
    favGroup._execute({ userId }, { groupId });
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'candidate', true);
    // Notify admins
    if (this.userId !== userId) createRequestNotification(this.userId, userId, groupId);
  },
});

export const unsetCandidateOf = new ValidatedMethod({
  name: 'users.unsetCandidateOf',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ userId, groupId }) {
    // allow to unset candidate for self or as admin/animator
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetCandidateOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetCandidateOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.candidates.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetCandidateOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'candidate', groupId);
    // remove info from group collection
    if (group.candidates.indexOf(userId) !== -1) {
      Groups.update(groupId, {
        $pull: { candidates: userId },
      });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['animator', 'member', 'admin'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'candidate', false);
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

export const setLogoutType = new ValidatedMethod({
  name: 'users.setLogoutType',
  validate: new SimpleSchema({
    logoutType: { type: String, label: getLabel('api.users.labels.logoutType') },
  }).validator(),

  run({ logoutType }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.setLogoutType.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    Meteor.users.update(this.userId, {
      $set: { logoutType },
    });
  },
});

export const setAvatar = new ValidatedMethod({
  name: 'users.setAvatar',
  validate: new SimpleSchema({
    avatar: {
      type: String,
      label: getLabel('api.users.labels.avatar'),
    },
  }).validator(),

  run({ avatar }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.setAvatar.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    Meteor.users.update(this.userId, {
      $set: { avatar },
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

export const findUser = new ValidatedMethod({
  name: 'users.findUser',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  }).validator(),

  run({ userId }) {
    return Meteor.users.findOne({ _id: userId }, { fields: { firstName: 1, lastName: 1, _id: 1 } });
  },
});

export const userUpdated = new ValidatedMethod({
  name: 'users.userUpdated',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
    data: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  }).validator(),

  run({ userId, data }) {
    // this function is used to provide hooks when user data is updated
    // (currently when logging in with keycloak)
    if (!Meteor.isServer) {
      // this should be run by server side code only
      throw new Meteor.Error('api.users.userUpdated.notPermitted', i18n.__('api.users.notPermitted'));
    }
    return [userId, data];
  },
});

export const setQuota = new ValidatedMethod({
  name: 'users.setQuota',
  validate: new SimpleSchema({
    quota: { type: Number },
    userId: { type: String },
  }).validator(),

  run({ quota, userId }) {
    // this function is used to provide hooks when user data is updated
    // (currently when logging in with keycloak)
    if (!Meteor.isServer) {
      // this should be run by server side code only
      throw new Meteor.Error('api.users.userUpdated.notPermitted', i18n.__('api.users.notPermitted'));
    }
    Meteor.users.update(
      { _id: userId },
      {
        $set: {
          groupQuota: quota,
        },
      },
    );
  },
});

export const toggleAdvancedPersonalPage = new ValidatedMethod({
  name: 'users.toggleAdvancedPersonalPage',
  validate: null,

  run() {
    if (!this.userId) {
      throw new Meteor.Error('api.users.toggleAdvancedPersonalPage.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.toggleAdvancedPersonalPage.unknownUser', i18n.__('api.users.unknownUser'));
    }
    const newValue = !(user.advancedPersonalPage || false);
    Meteor.users.update(this.userId, { $set: { advancedPersonalPage: newValue } });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    setUsername,
    setName,
    setStructure,
    setActive,
    removeUser,
    setAdminOf,
    unsetAdminOf,
    setAdminStructure,
    unsetAdminStructure,
    setAnimatorOf,
    unsetAnimatorOf,
    setMemberOf,
    unsetMemberOf,
    setCandidateOf,
    unsetCandidateOf,
    findUsers,
    findUser,
    setLanguage,
    setLogoutType,
    setKeycloakId,
    setAvatar,
    userUpdated,
    toggleAdvancedPersonalPage,
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
