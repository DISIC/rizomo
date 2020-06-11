import { Meteor } from 'meteor/meteor';

import { isActive } from '../../utils';
import Notifications from '../notifications';

Meteor.publish('notifications.self', function notificationsForConnectedUser() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Notifications.find(
    { userId: this.userId },
    { fields: Notifications.publicFields, sort: { createdAt: 1 }, limit: 1000 },
  );
});
