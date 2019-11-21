import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Factory } from "meteor/dburles:factory";
import SimpleSchema from "simpl-schema";
// import faker from "faker";
import { Random } from "meteor/random";
import { Tracker } from "meteor/tracker";

import { Events } from "../events/events";

const Groups = new Mongo.Collection("groups");

// Deny all client-side updates since we will be using methods to manage this collection
Groups.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  }
});

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
    admins: { type: Array, defaultValue: [] },
    "admins.$": { type: String, regEx: SimpleSchema.RegEx.Id },
    members: { type: Array, defaultValue: [] },
    "members.$": { type: String, regEx: SimpleSchema.RegEx.Id },
    candidates: { type: Array, defaultValue: [] },
    "candidates.$": { type: String, regEx: SimpleSchema.RegEx.Id }
  },
  { tracker: Tracker }
);

Groups.publicFields = {
  name: 1,
  info: 1,
  note: 1,
  active: 1,
  groupPadID: 1,
  digest: 1,
  type: 1,
  owner: 1,
  admins: 1,
  members: 1,
  candidates: 1
};

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

Factory.define("group", Groups, {
  name: () => Random.id(),
  active: true,
  type: 0,
  admins: [],
  members: [],
  candidates: []
});

export { Groups };
