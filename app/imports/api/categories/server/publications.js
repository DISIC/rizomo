import { Meteor } from 'meteor/meteor';

import { isActive } from '../../utils';
import Categories from '../categories';

// publish all categories
Meteor.publish('categories.all', function categoriesAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Categories.find({}, { fields: Categories.publicFields, sort: { name: 1 }, limit: 1000 });
});

// publish categories for a service
Meteor.publish('categories.service', function categoriesForAService({ categories }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Categories.find(
    { _id: { $in: categories } },
    { fields: Categories.publicFields, sort: { name: 1 }, limit: 1000 },
  );
});
