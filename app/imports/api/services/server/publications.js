import { Meteor } from 'meteor/meteor';

import { isActive } from '../../utils';
import Services from '../services';

// publish additional fields for users
Meteor.publish('services.all', function groupsAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({}, { fields: Services.publicFields });
});

Meteor.publish('services.one', function servicesOne({ slug }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({ slug }, { fields: Services.allPublicFields, sort: { name: 1 }, limit: 1 });
});
