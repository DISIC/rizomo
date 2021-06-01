import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import SimpleSchema from 'simpl-schema';
import { checkPaginationParams, isActive, getLabel } from '../../utils';
import Groups from '../../groups/groups';
import { structures } from '../structures';
import logServer from '../../logging';

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

// publish all structure admin assignments for one structure
Meteor.publish('roles.adminStructure', function publishStructureAdmins() {
  const user = Meteor.users.findOne({ _id: this.userId });
  if (
    !isActive(this.userId) ||
    (!Roles.userIsInRole(this.userId, 'adminStructure', user.structure) && !Roles.userIsInRole(this.userId, 'admin'))
  ) {
    return this.ready();
  }
  return Meteor.roleAssignment.find({ 'role._id': 'adminStructure', scope: user.structure });
});

// publish all structure admin assignments for all structure
Meteor.publish('roles.adminStructureAll', function publishStructureAdminsAll() {
  const ret = Meteor.roleAssignment.find({ 'role._id': 'adminStructure', scope: { $in: structures } });

  if (
    !isActive(this.userId) ||
    (ret.fetch().indexOf(this.userId) !== -1 && !Roles.userIsInRole(this.userId, 'admin'))
  ) {
    return this.ready();
  }
  return ret;
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
FindFromPublication.publish('users.group', function usersFromGroup({ page, itemPerPage, slug, search, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.groups.labels.slug'),
      },
    })
      .extend(checkPaginationParams)
      .validate({ page, itemPerPage, slug, search });
  } catch (err) {
    logServer(`publish users.group: ${err}`);
    this.error(err);
  }

  try {
    const query = queryUsersFromGroup({ slug, search });

    return Meteor.users.find(query, {
      fields: Meteor.users.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { lastName: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
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
FindFromPublication.publish('users.publishers', ({ page, itemPerPage, search, ...rest }) => {
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish users.publishers: ${err}`);
    this.error(err);
  }
  const pubFields = { ...Meteor.users.publicFields };
  // do not leak email adresses on public page
  delete pubFields.emails;
  delete pubFields.username;

  try {
    const query = queryUsersPublishers({ search });
    return Meteor.users.find(query, {
      fields: pubFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});

Meteor.methods({
  // count all users from a group
  'get_users.group_count': ({ search, slug }) => {
    try {
      const query = queryUsersFromGroup({ slug, search });

      return Meteor.users
        .find(query, {
          sort: { lastName: 1 },
        })
        .count();
    } catch (error) {
      return 0;
    }
  },
  // count all users who published
  'get_users.publishers_count': ({ search }) => {
    try {
      const query = queryUsersPublishers({ search });

      return Meteor.users
        .find(query, {
          sort: { lastname: 1 },
        })
        .count();
    } catch (error) {
      return 0;
    }
  },
});

// build query for all users from group
const queryUsersAdmin = ({ search }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username', 'structure'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    $or: searchQuery,
  };
};

// publish all users from a group
FindFromPublication.publish('users.admin', function usersAdmin({ page, itemPerPage, search, ...rest }) {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish users.admin : ${err}`);
    this.error(err);
  }

  try {
    const query = queryUsersAdmin({ search });

    return Meteor.users.find(query, {
      fields: Meteor.users.adminFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { lastName: 1, firstName: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});
// count all users
Meteor.methods({
  'get_users.admin_count': ({ search }) => {
    try {
      const query = queryUsersAdmin({ search });

      return Meteor.users
        .find(query, {
          sort: { lastName: 1 },
        })
        .count();
    } catch (error) {
      return 0;
    }
  },
});

// build query for all users with same structure
const queryUsersByStructure = ({ search }, currentStructure) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    structure: currentStructure,
    $or: searchQuery,
  };
};

// publish all users with same structure
FindFromPublication.publish('users.byStructure', function usersStructure({ page, itemPerPage, search, ...rest }) {
  const currentUser = Meteor.users.findOne(this.userId);
  if (
    !isActive(this.userId) ||
    (!Roles.userIsInRole(this.userId, 'admin') &&
      !Roles.userIsInRole(this.userId, 'adminStructure', currentUser.structure))
  ) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish users.byStructure : ${err}`);
    this.error(err);
  }

  try {
    const query = queryUsersByStructure({ search }, currentUser.structure);
    return Meteor.users.find(query, {
      fields: Meteor.users.adminFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { lastName: 1, firstName: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});
// count structure users
Meteor.methods({
  'get_users.byStructure_count': function queryUsersStructureCount({ search }) {
    const currentUser = Meteor.users.findOne(this.userId);
    try {
      const query = queryUsersByStructure({ search }, currentUser.structure);

      return Meteor.users
        .find(query, {
          sort: { lastName: 1 },
        })
        .count();
    } catch (error) {
      return 0;
    }
  },
});
