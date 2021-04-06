import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import slugify from 'slugify';
import { getLabel } from '../utils';

import Events from '../events/events';

const Groups = new Mongo.Collection('groups');

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
  },
});

Groups.schema = new SimpleSchema(
  {
    name: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      max: 60,
      label: getLabel('api.groups.labels.name'),
    },
    slug: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      label: getLabel('api.groups.labels.slug'),
      autoValue() {
        const name = this.field('name').value;
        // if name is not being modified, do not calculate autovalue
        if (name === undefined) return undefined;
        const slug = slugify(name, {
          replacement: '-', // replace spaces with replacement
          remove: null, // regex to remove characters
          lower: true, // result in lower case
        });
        return slug;
      },
    },
    description: {
      type: String,
      optional: true,
      label: getLabel('api.groups.labels.description'),
    },
    content: {
      type: String,
      optional: true,
      label: getLabel('api.groups.labels.content'),
    },
    active: { type: Boolean, label: getLabel('api.groups.labels.active') },
    groupPadID: {
      type: String,
      optional: true,
      label: getLabel('api.groups.labels.groupPadID'),
    },
    digest: {
      type: String,
      optional: true,
      label: getLabel('api.groups.labels.digest'),
    },
    type: {
      type: SimpleSchema.Integer,
      allowedValues: [0, 5, 10], // 0 Ouvert, 5 Modéré, 10 Fermé
      label: getLabel('api.groups.labels.type'),
    },
    applications: {
      type: Array,
      optional: true,
    },
    'applications.$': {
      type: String,
      label: getLabel('api.groups.labels.applications'),
    },
    owner: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.groups.labels.owner'),
    },
    admins: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.groups.labels.admins'),
    },
    'admins.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    animators: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.groups.labels.animators'),
    },
    'animators.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    members: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.groups.labels.members'),
    },
    'members.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    candidates: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.groups.labels.candidates'),
    },
    'candidates.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    numCandidates: {
      type: Number,
      defaultValue: 0,
      label: getLabel('api.groups.labels.numCandidates'),
    },
    plugins: {
      type: Object,
      defaultValue: {},
      optional: true,
      blackbox: true,
      label: getLabel('api.groups.labels.plugins'),
    },
    meeting: {
      // server-side only, do not publish
      type: Object,
      defaultValue: {},
      label: getLabel('api.groups.labels.meetingParams'),
    },
    'meeting.attendeePW': { type: String, defaultValue: '' },
    'meeting.moderatorPW': { type: String, defaultValue: '' },
    'meeting.createTime': { type: String, defaultValue: '' },
  },
  { tracker: Tracker },
);

Groups.after.update(function countCandidates(_, doc, fieldNames) {
  if (fieldNames.includes('candidates')) {
    if (!this.previous.candidates || this.previous.candidates.length !== doc.candidates.length) {
      Groups.update({ _id: doc._id }, { $set: { numCandidates: doc.candidates.length } });
    }
  }
});

Groups.typeLabels = {
  0: 'api.groups.types.open',
  5: 'api.groups.types.moderated',
  10: 'api.groups.types.private',
};

Groups.publicFields = {
  name: 1,
  slug: 1,
  description: 1,
  active: 1,
  groupPadID: 1,
  digest: 1,
  type: 1,
  owner: 1,
  numCandidates: 1,
  plugins: 1,
};
Groups.allPublicFields = {
  content: 1,
  applications: 1,
  ...Groups.publicFields,
};

Groups.adminFields = {
  admins: 1,
  animators: 1,
  members: 1,
  candidates: 1,
  ...Groups.allPublicFields,
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
  },
});

Groups.attachSchema(Groups.schema);

export default Groups;
