import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { publishComposite } from 'meteor/reywood:publish-composite';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import SimpleSchema from 'simpl-schema';

import { checkPaginationParams, isActive, getLabel } from '../../utils';
import Groups from '../groups';
import AppRoles from '../../users/users';
import logServer from '../../logging';
import { Polls } from '../../polls/polls';
import { EventsAgenda } from '../../eventsAgenda/eventsAgenda';

// publish groups that user is admin/animator of
publishComposite('groups.adminof', function groupsAdminOf() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  // if user has global admin, get all groups
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return {
      find() {
        return Groups.find({}, { fields: Groups.adminFields });
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
          return Groups.find(role.scope, { fields: Groups.adminFields });
        },
      },
    ],
  };
});

// publish groups that user is admin/animator/member of
publishComposite('groups.member', function groupsAdminOf() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return {
    find() {
      return Meteor.roleAssignment.find({
        'user._id': this.userId,
        'role._id': { $in: ['admin', 'animator', 'member'] },
        scope: { $ne: null },
      });
    },
    children: [
      {
        find(role) {
          return Groups.find(role.scope, { fields: Groups.adminFields });
        },
      },
    ],
  };
});

FindFromPublication.publish('groups.one.admin', function GroupsOne({ _id }) {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, ['admin', 'animator'], _id)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ _id });
  } catch (err) {
    logServer(`publish groups.one.admin : ${err}`);
    this.error(err);
  }
  return Groups.find({ _id }, { fields: Groups.adminFields, sort: { name: 1 }, limit: 1 });
});

// publish one group and all users associated with given role
publishComposite('groups.users', function groupDetails({ groupId, role = 'member' }) {
  try {
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
  } catch (err) {
    logServer(`publish groups.users : ${err}`);
    this.error(err);
  }
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

// build query for all groups
const queryAllGroups = ({ search }) => {
  const regex = new RegExp(search, 'i');
  return {
    type: { $ne: 10 },
    $or: [
      {
        name: { $regex: regex },
      },
      {
        description: { $regex: regex },
      },
    ],
  };
};

// build query for groups where user is member of
const queryAllGroupsMemberOf = ({ search, groups }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['name', 'type', 'description', 'slug', 'avatar', 'content'];
  const searchQuery = fieldsToSearch.map((field) => ({
    [field]: { $regex: regex },
    _id: { $in: groups },
  }));
  return {
    $or: searchQuery,
  };
};

Meteor.methods({
  'get_groups.memberOf_count': ({ search, userId }) => {
    const groups = Meteor.users.findOne({ _id: userId }).favGroups;

    try {
      const query = queryAllGroupsMemberOf({ search, groups });
      return Groups.find(query, { fields: Groups.publicFields, sort: { name: 1 } }).count();
    } catch (error) {
      return 0;
    }
  },
});

Meteor.methods({
  'get_groups.all_count': ({ search }) => {
    try {
      const query = queryAllGroups({ search });
      return Groups.find(query, { fields: Groups.publicFields, sort: { name: 1 } }).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all existing groups
FindFromPublication.publish('groups.all', function groupsAll({ page, search, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish groups.all : ${err}`);
    this.error(err);
  }

  try {
    const query = queryAllGroups({ search });

    return Groups.find(query, {
      fields: Groups.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { name: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});

// publish all existing groups where user is member
FindFromPublication.publish('groups.memberOf', function groupsMemberOf({ page, search, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish groups.memberOf : ${err}`);
    this.error(err);
  }

  const groups = Meteor.users.findOne({ _id: this.userId }).favGroups;

  try {
    const query = queryAllGroupsMemberOf({ search, groups });

    return Groups.find(query, {
      fields: Groups.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { name: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});

// publish one group based on its slug
FindFromPublication.publish('groups.one', function groupsOne({ slug }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.groups.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`publish groups.one : ${err}`);
    this.error(err);
  }
  return Groups.find(
    { slug },
    {
      fields: Groups.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  );
});

// publish one group and events and pools based on its slug
publishComposite('groups.single', function groupSingle({ slug }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.groups.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`publish groups.one : ${err}`);
    this.error(err);
  }

  return {
    find() {
      return Groups.find({ slug }, { fields: Groups.allPublicFields, limit: 1, sort: { name: -1 } });
    },
    children: [
      {
        find(group) {
          const groupId = group._id;
          return Polls.find(
            { groups: { $in: [groupId] }, active: true },
            {
              fields: {
                _id: 1,
              },
            },
          );
        },
      },
      {
        find(group) {
          const groupId = group._id;
          const date = new Date().toISOString();
          return EventsAgenda.find(
            { groups: { $elemMatch: { id: groupId } }, end: { $gte: date } },
            {
              fields: {
                _id: 1,
              },
            },
          );
        },
      },
    ],
  };
});
