import { Meteor } from 'meteor/meteor';

import { isActive } from '../../utils';
import Groups from '../groups';

// publish additional fields for users
Meteor.publish('groups.all', function groupsAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Groups.find({}, { fields: Groups.publicFields });
});
