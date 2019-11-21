import { Meteor } from "meteor/meteor";

// publish additional fields for users
Meteor.publish("userData", function() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: Meteor.users.selfFields
      }
    );
  } else {
    this.ready();
  }
});

Meteor.publish("users.all", function() {
  return Meteor.users.find(
    {},
    {
      fields: Meteor.users.publicFields
    }
  );
});
