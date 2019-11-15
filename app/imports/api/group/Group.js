import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";
import { Tracker } from "meteor/tracker";

import { Events } from "../event/Event";

const Groups = new Mongo.Collection("groups");

Groups.schema = new SimpleSchema(
  {
    name: {
      type: String,
      index: true,
      unique: true,
      min: 1
    },
    info: { type: String, optional: true },
    note: { type: String, optional: true },
    active: Boolean,
    groupPadID: { type: String, optional: true },
    digest: { type: String, optional: true },
    type: SimpleSchema.Integer, // 0 Ouvert, 5 Modéré, 10 Fermé
    owner: { type: String, regEx: SimpleSchema.RegEx.Id },
    admins: Array,
    "admins.$": { type: String, regEx: SimpleSchema.RegEx.Id },
    members: Array,
    "members.$": { type: String, regEx: SimpleSchema.RegEx.Id },
    candidates: Array,
    "candidates.$": { type: String, regEx: SimpleSchema.RegEx.Id }
  },
  { tracker: Tracker }
);

Groups.helpers({
  getEvents() {
    return Events.find({ groupe: this._id }, { sort: { startsAt: -1 } });
  },
  getAdmins() {
    return Meteor.users.find({ _id: { $in: this.admins } });
  },
  getMembers() {
    return Meteor.users.find({ _id: { $in: this.members } });
  },
  getCandidates() {
    return Meteor.users.find({ _id: { $in: this.candidates } });
  }
});

Groups.attachSchema(Groups.schema);

export { Groups };
