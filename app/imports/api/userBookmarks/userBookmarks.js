import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const UserBookmarks = new Mongo.Collection('userBookmarks');

// Deny all client-side updates since we will be using methods to manage this collection
UserBookmarks.deny({
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

UserBookmarks.schema = new SimpleSchema(
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
    userId: {
      type: String,
      label: getLabel('api.users.labels.id'),
    },
    tag: {
      type: String,
      label: getLabel('api.bookmarks.labels.tag'),
    },
    icon: {
      type: String,
      label: getLabel('api.bookmarks.labels.icon'),
      defaultValue: '',
    },
  },
  { clean: { removeEmptyStrings: false }, tracker: Tracker },
);

UserBookmarks.publicFields = {
  url: 1,
  name: 1,
  userId: 1,
  icon: 1,
};

UserBookmarks.attachSchema(UserBookmarks.schema);

export default UserBookmarks;
