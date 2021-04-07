import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Categories = new Mongo.Collection('categories');

// Deny all client-side updates since we will be using methods to manage this collection
Categories.deny({
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

Categories.schema = new SimpleSchema(
  {
    name: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      label: getLabel('api.categories.labels.name'),
    },
  },
  { tracker: Tracker },
);

Categories.publicFields = {
  name: 1,
};

Categories.attachSchema(Categories.schema);

export default Categories;
