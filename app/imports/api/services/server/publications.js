import { Meteor } from 'meteor/meteor';

import { publishComposite } from 'meteor/reywood:publish-composite';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { getLabel, isActive } from '../../utils';
import Services from '../services';
import Categories from '../../categories/categories';
import logServer from '../../logging';

// publish additional fields for users
Meteor.publish('services.all', function servicesAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({}, { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 });
});

FindFromPublication.publish('services.one.admin', function servicesOne({ _id }) {
  try {
    new SimpleSchema({
      _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ _id });
  } catch (err) {
    logServer(`publish services.one.admin : ${err}`);
    this.error(err);
  }
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  return Services.find({ _id }, { fields: Services.allPublicFields, sort: { title: 1 }, limit: 1 });
});

FindFromPublication.publish('services.group', function servicesGroup({ ids }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({ _id: { $in: ids } }, { fields: Services.allPublicFields, sort: { title: 1 }, limit: 100 });
});

publishComposite('services.one', ({ slug }) => {
  try {
    new SimpleSchema({
      slug: {
        optional: true,
        type: String,
        label: getLabel('api.services.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`publish services.one : ${err}`);
    this.error(err);
  }
  return {
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
  };
});
