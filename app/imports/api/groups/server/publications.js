import { Meteor } from "meteor/meteor";

import { Groups } from "../groups";

// publish additional fields for users
Meteor.publish("groups", function() {
  return Groups.find({}, { fields: Groups.publicFields });
});
