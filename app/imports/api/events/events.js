import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";
import { Tracker } from "meteor/tracker";

const Events = new Mongo.Collection("events");

Events.schema = new SimpleSchema(
  {
    title: String,
    startsAt: Date,
    endsAt: Date,
    allDay: Boolean,
    info: String,
    lieu: String,
    groupe: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    eventPadID: String,
    participants: Array,
    "participants.$": {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  },
  { tracker: Tracker }
);

Events.attachSchema(Events.schema);

Events.helpers({
  getParticipants() {
    return Meteor.users.find({ _id: { $in: this.participants } });
  }
});

export { Events };
