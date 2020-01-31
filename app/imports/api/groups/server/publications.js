import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { publishComposite } from 'meteor/reywood:publish-composite';

import { isActive } from '../../utils';
import Groups from '../groups';

// publish all existing groups
Meteor.publish('groups.all', function groupsAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Groups.find({}, { fields: Groups.publicFields, sort: { name: 1 } });
});

// publish groups that user is member of
publishComposite('groups.memberof', function groupsMemberOf() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return {
    find() {
      return Meteor.roleAssignment.find({ 'user._id': this.userId, 'role._id': 'member', scope: { $ne: null } });
    },
    children: [
      {
        find(role) {
          return Groups.find(role.scope, { fields: Groups.publicFields });
        },
      },
    ],
  };
});

// publish groups that user is admin/animator of
publishComposite('groups.adminof', function groupsAdminOf() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  // if user has global admin, get all groups
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return {
      find() {
        return Groups.find({}, { fields: Groups.publicFields });
      },
    };
  }
  // otherwise get groups user is admin/animator of
  return {
    find() {
      return Meteor.roleAssignment.find({
        'user._id': this.userId,
        'role._id': { $in: ['admin', 'animator'] },
        scope: { $ne: null },
      });
    },
    children: [
      {
        find(role) {
          return Groups.find(role.scope, { fields: Groups.publicFields });
        },
      },
    ],
  };
});

// publish one group and all users associated
publishComposite('groups.details', function groupDetails(groupId) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return {
    find() {
      check(groupId, String);
      return Groups.find(groupId, { fields: Groups.publicFields });
    },
    children: [
      {
        find(group) {
          return Meteor.users.find({ _id: { $in: group.candidates } }, { fields: Meteor.users.publicFields });
        },
      },
      {
        find(group) {
          return Meteor.users.find({ _id: { $in: group.members } }, { fields: Meteor.users.publicFields });
        },
      },
      {
        find(group) {
          return Meteor.users.find({ _id: { $in: group.animators } }, { fields: Meteor.users.publicFields });
        },
      },
      {
        find(group) {
          return Meteor.users.find({ _id: { $in: group.admins } }, { fields: Meteor.users.publicFields });
        },
      },
    ],
  };
});
