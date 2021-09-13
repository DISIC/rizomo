import { Meteor } from 'meteor/meteor';

import { publishComposite } from 'meteor/reywood:publish-composite';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { getLabel, isActive } from '../../utils';
import Services from '../services';
import Categories from '../../categories/categories';
import logServer from '../../logging';

// publish available services not attached to a structure
Meteor.publish('services.all', function servicesAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({ structure: '' }, { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 });
});

// publish available sergices attached to current user structure
FindFromPublication.publish('services.structure', function servicesStructure() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const userStructure = Meteor.users.findOne(this.userId).structure;
  if (userStructure) {
    return Services.find(
      { structure: userStructure },
      { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 },
    );
  }
  return this.ready();
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
  const service = Services.findOne(_id);
  const isStructureAdmin = service.structure && Roles.userIsInRole(this.userId, 'adminStructure', service.structure);
  if (isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isStructureAdmin)) {
    return Services.find({ _id }, { fields: Services.allPublicFields, sort: { title: 1 }, limit: 1 });
  }
  return this.ready();
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
