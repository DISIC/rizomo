import { Meteor } from "meteor/meteor";

// publish additional fields for users
Meteor.publish("userData", function() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: Meteor.users.publicFields
      }
    );
  } else {
    this.ready();
  }
});
