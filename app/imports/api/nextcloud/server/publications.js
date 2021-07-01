import { Meteor } from 'meteor/meteor';
import { isActive } from '../../utils';
import Nextcloud from '../nextcloud';

Meteor.publish('nextcloud.all', function nextcloudAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Nextcloud.find({}, { fields: Nextcloud.publicFields, sort: { url: 1 }, limit: 1000 });
});
