import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { isActive } from '../../utils';
import Groups from '../../groups/groups';

// publish additional fields for current user
Meteor.publish('userData', function publishUserData() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: Meteor.users.selfFields,
      },
    );
  }
  return this.ready();
});

// publish users waiting for activation by admin
Meteor.publish('users.request', function usersRequest() {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  return Meteor.users.find(
    { isRequest: true },
    {
      fields: Meteor.users.adminFields,
    },
  );
});

// publish users waiting for activation by admin
Meteor.publish('users.fromlist', function usersFromList(userIds = []) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Meteor.users.find(
    { _id: { $in: userIds } },
    {
      fields: {
        username: 1,
        emails: 1,
        firstName: 1,
        lastName: 1,
      },
    },
  );
});

// automatically publish assignments for current user
Meteor.publish(null, function publishAssignments() {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});
// publish all admin assignments (global admin)
Meteor.publish('roles.admin', function publishAdmins() {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  return Meteor.roleAssignment.find({ 'role._id': 'admin', scope: null });
});
// Publish all existing roles
Meteor.publish(null, function publishRoles() {
  if (this.userId) {
    return Meteor.roles.find({});
  }
  return this.ready();
});

// build query for all users from group
const queryUsersFromGroup = ({ slug, search }) => {
  const { admins, members, animators } = Groups.findOne({ slug });
  const ids = [...admins, ...members, ...animators];
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    _id: { $in: ids },
    $or: searchQuery,
  };
};

// publish all users from a group
FindFromPublication.publish('users.group', function usersFromGroup({
  page, itemPerPage, slug, search, ...rest
}) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const query = queryUsersFromGroup({ slug, search });

  return Meteor.users.find(query, {
    fields: Meteor.users.publicFields,
    skip: itemPerPage * (page - 1),
    limit: itemPerPage,
    sort: { lastName: 1 },
    ...rest,
  });
});

// build query for all users who published articles
const queryUsersPublishers = ({ search }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    articlesCount: { $gt: 0 },
    $or: searchQuery,
  };
};

// publish all users who published articles
FindFromPublication.publish('users.publishers', ({
  page, itemPerPage, search, ...rest
}) => {
  const pubFields = { ...Meteor.users.publicFields };
  // do not leak email adresses on public page
  delete pubFields.emails;
  delete pubFields.username;
  const query = queryUsersPublishers({ search });
  return Meteor.users.find(query, {
    fields: pubFields,
    skip: itemPerPage * (page - 1),
    limit: itemPerPage,
    ...rest,
  });
});

Meteor.methods({
  // count all users from a group
  'get_users.group_count': ({ search, slug }) => {
    const query = queryUsersFromGroup({ slug, search });

    return Meteor.users
      .find(query, {
        sort: { lastName: 1 },
      })
      .count();
  },
  // count all users who published
  'get_users.publishers_count': ({ search }) => {
    const query = queryUsersPublishers({ search });

    return Meteor.users
      .find(query, {
        sort: { lastname: 1 },
      })
      .count();
  },
});

// build query for all users from group
const queryUsersAdmin = ({ search }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    $or: searchQuery,
  };
};

// publish all users from a group
FindFromPublication.publish('users.admin', function usersAdmin({
  page, itemPerPage, search, ...rest
}) {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  const query = queryUsersAdmin({ search });

  return Meteor.users.find(query, {
    fields: Meteor.users.adminFields,
    skip: itemPerPage * (page - 1),
    limit: itemPerPage,
    sort: { lastName: 1, firstName: 1 },
    ...rest,
  });
});
// count all users
Meteor.methods({
  'get_users.admin_count': ({ search }) => {
    const query = queryUsersAdmin({ search });

    return Meteor.users
      .find(query, {
        sort: { lastName: 1 },
      })
      .count();
  },
});
