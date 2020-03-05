import { Meteor } from 'meteor/meteor';

import { publishComposite } from 'meteor/reywood:publish-composite';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Roles } from 'meteor/alanning:roles';
import { isActive } from '../../utils';
import Services from '../services';
import Categories from '../../categories/categories';

// publish additional fields for users
Meteor.publish('services.all', function servicesAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({}, { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 });
});

FindFromPublication.publish('services.one.admin', function servicesOne({ _id }) {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  return Services.find({ _id }, { fields: Services.allPublicFields, sort: { title: 1 }, limit: 1 });
});

publishComposite('services.one', ({ slug }) => ({
  find() {
    // Find top ten highest scoring posts
    return Services.find({ slug }, { fields: Services.allPublicFields, sort: { title: 1 }, limit: 1 });
  },
  children: [
    {
      find({ categories = [] }) {
        // Find top two comments on post
        return Categories.find(
          { _id: { $in: categories } },
          { fields: Categories.publicFields, sort: { name: 1 }, limit: 1000 },
        );
      },
    },
  ],
}));
