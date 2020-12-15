import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import { getLabel } from '../utils';

const Tags = new Mongo.Collection('tags');

// Deny all client-side updates since we will be using methods to manage this collection
Tags.deny({
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

Tags.schema = new SimpleSchema(
  {
    name: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      label: getLabel('api.tags.labels.name'),
    },
  },
  { tracker: Tracker },
);

Tags.publicFields = {
  name: 1,
};

Factory.define('tag', Tags, {
  name: () => Random.id().toLowerCase(),
});

Tags.attachSchema(Tags.schema);

export default Tags;
