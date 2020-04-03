import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

const PersonalSpaces = new Mongo.Collection('personalspaces');

// Deny all client-side updates since we will be using methods to manage this collection
PersonalSpaces.deny({
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

PersonalSpaces.schema = new SimpleSchema(
  {
    userId: {
      type: String,
      index: true,
      unique: true,
      min: 1,
    },
    unsorted: {
      type: Array,
      defaultValue: [],
    },
    'unsorted.$': {
      type: Object,
    },
    'unsorted.$.type': {
      type: String,
    },
    'unsorted.$.element_id': {
      type: String,
    },
    'unsorted.$.title': {
      type: String,
      optional: true,
    },
    'unsorted.$.url': {
      type: String,
      optional: true,
    },
    sorted: {
      type: Array,
      defaultValue: [],
    },
    'sorted.$': {
      type: Object,
    },
    'sorted.$.zone_id': {
      type: String,
    },
    'sorted.$.name': {
      type: String,
    },
    'sorted.$.elements': {
      type: Array,
      defaultValue: [],
    },
    'sorted.$.elements.$': {
      type: Object,
    },
    'sorted.$.elements.$.type': {
      type: String,
    },
    'sorted.$.elements.$.element_id': {
      type: String,
    },
    'sorted.$.elements.$.title': {
      type: String,
      optional: true,
    },
    'sorted.$.elements.$.url': {
      type: String,
      optional: true,
    },
  },
  { tracker: Tracker },
);

PersonalSpaces.publicFields = {
  userId: 1,
  unsorted: 1,
  sorted: 1,
};

Factory.define('personalspace', PersonalSpaces, {
  userId: () => Random.id(),
  unsorted: [],
  sorted: [],
});

PersonalSpaces.attachSchema(PersonalSpaces.schema);

export default PersonalSpaces;
