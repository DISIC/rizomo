import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { isActive } from '../../utils';

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

const optionsSchema = new SimpleSchema({
  page: {
    type: SimpleSchema.Integer,
    min: 1,
    defaultValue: 1,
    optional: true,
  },
  pageSize: {
    type: SimpleSchema.Integer,
    min: 1,
    defaultValue: 10,
    optional: true,
  },
  filter: { type: String, defaultValue: '', optional: true },
  sortColumn: {
    type: String,
    allowedValues: ['_id', ...Meteor.users.schema.objectKeys()],
    defaultValue: 'username',
    optional: true,
  },
  sortOrder: {
    type: SimpleSchema.Integer,
    allowedValues: [1, -1],
    defaultValue: 1,
    optional: true,
  },
});

// publish all users with pagination. options is an object containing parameters
// default values : {page:1, pageSize:10, filter:'', sortColumn:'username', sortOrder:1}
Meteor.publish('users.all', function usersAll(options) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  isAdmin = Roles.userIsInRole(this.userId, 'admin');
  clean_opts = optionsSchema.clean(options || {});
  optionsSchema.validate(clean_opts);
  const {
    page, pageSize, filter, sortColumn, sortOrder,
  } = clean_opts;
  // calculate number of entries to skip
  const skip = (page - 1) * pageSize;
  const sort = {};
  sort[sortColumn] = sortOrder;
  let query = {};
  if (filter && filter.length > 0) {
    const emails = {
      $elemMatch: {
        address: { $regex: `.*${filter}.*`, $options: 'i' },
      },
    };
    query = {
      $or: [
        {
          username: { $regex: `.*${filter}.*`, $options: 'i' },
        },
        { emails },
        {
          lastname: { $regex: `.*${filter}.*`, $options: 'i' },
        },
        {
          firstname: { $regex: `.*${filter}.*`, $options: 'i' },
        },
      ],
    };
  }
  return Meteor.users.find(query, {
    skip,
    limit: pageSize,
    fields: isAdmin ? Meteor.users.adminFields : Meteor.users.publicFields,
    sort,
  });
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
// Publish all existing roles
Meteor.publish(null, function publishRoles() {
  if (this.userId) {
    return Meteor.roles.find({});
  }
  return this.ready();
});
