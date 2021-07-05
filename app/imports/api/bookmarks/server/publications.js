import SimpleSchema from 'simpl-schema';
import { isActive } from '../../utils';
import Bookmarks from '../bookmarks';

Meteor.publish('bookmark.group.all', function bookmarkAll({ groupId }) {
  try {
    new SimpleSchema({
      groupId: {
        type: String,
      },
    }).validate({ groupId });
  } catch (err) {
    return this.ready();
  }

  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Bookmarks.find({ groupId }, { sort: { name: 1 } });
});
