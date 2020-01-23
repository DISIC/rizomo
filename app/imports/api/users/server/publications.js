import { Meteor } from 'meteor/meteor';
import { isActive } from '../../utils';

// publish additional fields for users
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

Meteor.publish('users.all', function usersAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Meteor.users.find(
    {},
    {
      fields: Meteor.users.publicFields,
    },
  );
});

// automatically publish roles for current user
Meteor.publish(null, function publishAssignments() {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});
// Publish all existing roles
Meteor.publish(null, function publishRoles() {
  if (this.userId) {
    Meteor.roles.find({});
  }
  return this.ready();
});
