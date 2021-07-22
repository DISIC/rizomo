import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import getFavicon from '../../getFavicon';
import Bookmarks from '../bookmarks';

const getWebSiteFavicons = new ValidatedMethod({
  name: 'bookmark.getFavicon',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url },
  }).validator(),
  async run({ url }) {
    try {
      const icon = await getFavicon(url);
      if (icon === undefined) {
        Bookmarks.update({ url }, { $set: { icon: '' } });
      } else {
        Bookmarks.update({ url }, { $set: { icon } });
      }
    } catch (err) {
      //
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([getWebSiteFavicons], 'name');

// Only allow 5 list operations per connection per second
DDPRateLimiter.addRule(
  {
    name(name) {
      return _.contains(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    },
  },
  5,
  1000,
);

export default getWebSiteFavicons;
