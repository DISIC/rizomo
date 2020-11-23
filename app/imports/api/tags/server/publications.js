import { Meteor } from 'meteor/meteor';
import { isActive } from '../../utils';
import Tags from '../tags';

// publish all categories
Meteor.publish('tags.all', function categoriesAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Tags.find({}, { fields: Tags.publicFields, sort: { name: 1 }, limit: 10000 });
});
