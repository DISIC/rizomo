import { Meteor } from "meteor/meteor";

// publish additional fields for users
Meteor.publish("userData", function() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: {
          memberOf: 1,
          candidateOf: 1,
          adminOf: 1,
          isActif: 1,
          isDemande: 1
        }
      }
    );
  } else {
    this.ready();
  }
});
