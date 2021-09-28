import SimpleSchema from 'simpl-schema';
import { isActive } from '../../utils';
import UserBookmarks from '../userBookmarks';

Meteor.publish('bookmark.user.all', function bookmarkAll({ userId }) {
  try {
    new SimpleSchema({
      userId: {
        type: String,
      },
    }).validate({ userId });
  } catch (err) {
    return this.ready();
  }

  if (!isActive(this.userId)) {
    return this.ready();
  }
  return UserBookmarks.find({ userId }, { sort: { name: 1 } });
});
