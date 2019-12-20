import { Meteor } from 'meteor/meteor';

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

Meteor.publish('users.all', () => Meteor.users.find(
  {},
  {
    fields: Meteor.users.publicFields,
  },
));

// automatically publish roles for current user
Meteor.publish(null, function PublishRoles() {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});
