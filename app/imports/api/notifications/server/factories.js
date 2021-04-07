import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import Notifications from '../notifications';

Factory.define('notification', Notifications, {
  userId: () => Random.id(),
  title: faker.lorem.words(),
  content: faker.lorem.sentences(2),
  type: 'info',
});
