import { Meteor } from 'meteor/meteor';

// publish additional fields for users
Meteor.publish('userData', () => {
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
