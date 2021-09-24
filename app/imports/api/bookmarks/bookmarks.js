import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Bookmarks = new Mongo.Collection('bookmarks');

// Deny all client-side updates since we will be using methods to manage this collection
Bookmarks.deny({
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

Bookmarks.schema = new SimpleSchema(
  {
    url: {
      type: String,
      min: 1,
      max: 256,
      label: getLabel('api.bookmarks.labels.url'),
    },
    name: {
      type: String,
      label: getLabel('api.bookmarks.labels.name'),
    },
    author: {
      type: String,
      label: getLabel('api.bookmarks.labels.author'),
    },
    groupId: {
      type: String,
      label: getLabel('api.bookmarks.labels.groupId'),
    },
    tag: {
      type: String,
      label: getLabel('api.bookmarks.labels.tag'),
      defaultValue: '',
    },
    icon: {
      type: String,
      label: getLabel('api.bookmarks.labels.icon'),
      defaultValue: '',
    },
  },
  { clean: { removeEmptyStrings: false }, tracker: Tracker },
);

Bookmarks.publicFields = {
  url: 1,
  name: 1,
  author: 1,
  group: 1,
  icon: 1,
};

Bookmarks.attachSchema(Bookmarks.schema);

export default Bookmarks;
