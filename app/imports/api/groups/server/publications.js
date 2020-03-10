import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { publishComposite } from 'meteor/reywood:publish-composite';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import SimpleSchema from 'simpl-schema';

import { isActive } from '../../utils';
import Groups from '../groups';
import AppRoles from '../../users/users';

Meteor.methods({
  'get_groups.all_count': ({ search }) => {
    const regex = new RegExp(search, 'i');

    return Groups.find(
      {
        type: { $ne: 10 },
        $or: [
          {
            name: { $regex: regex },
          },
          {
            description: { $regex: regex },
          },
        ],
      },
      { fields: Groups.publicFields, sort: { name: 1 } },
    ).count();
  },
});

const ITEM_PER_PAGE = 9;

// publish all existing groups
Meteor.publish('groups.all', function groupsAll({ page, search, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const regex = new RegExp(search, 'i');

  return Groups.find(
    {
      type: { $ne: 10 },
      $or: [
        {
          name: { $regex: regex },
        },
        {
          description: { $regex: regex },
        },
      ],
    },
    {
      fields: Groups.publicFields,
      sort: { name: 1 },
      limit: ITEM_PER_PAGE * page,
      ...rest,
    },
  );
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

FindFromPublication.publish('groups.one.admin', function GroupsOne({ _id }) {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin', _id)) {
    return this.ready();
  }
  return Groups.find({ _id }, { fields: Groups.publicFields, sort: { name: 1 }, limit: 1 });
});

// publish one group and all users associated with given role
publishComposite('groups.users', function groupDetails({ groupId, role = 'member' }) {
  new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    role: {
      type: String,
      allowedValues: AppRoles,
    },
  }).validate({ groupId, role });
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const usersField = `${role}s`;
  return {
    find() {
      return Groups.find({ _id: groupId }, { fields: { [usersField]: 1 }, limit: 1, sort: { name: 1 } });
    },
    children: [
      {
        find(group) {
          const users = group[usersField];
          return Meteor.users.find(
            { _id: { $in: users } },
            {
              fields: {
                username: 1,
                emails: 1,
                firstName: 1,
                lastName: 1,
              },
            },
          );
        },
      },
    ],
  };
});
