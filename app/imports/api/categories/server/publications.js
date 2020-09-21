import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { isActive } from '../../utils';
import Categories from '../categories';

// publish all categories
Meteor.publish('categories.all', function categoriesAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Categories.find({}, { fields: Categories.publicFields, sort: { name: 1 }, limit: 1000 });
});

function checkCategories(categories) {
  new SimpleSchema({
    categories: {
      type: Array,
    },
    'categories.$': {
      type: { type: String, regEx: SimpleSchema.RegEx.Id },
    },
  }).validate({ categories });
}

// publish categories for a service
Meteor.publish('categories.service', function categoriesForAService({ categories }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  checkCategories(categories);
  return Categories.find(
    { _id: { $in: categories } },
    { fields: Categories.publicFields, sort: { name: 1 }, limit: 1000 },
  );
});
