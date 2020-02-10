import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

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
    },
  },
  { tracker: Tracker },
);

Categories.publicFields = {
  name: 1,
};

Factory.define('categorie', Categories, {
  name: () => Random.id(),
});

Categories.attachSchema(Categories.schema);

export default Categories;
