import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import PersonalSpaces from '../personalspaces';

Factory.define('personalspace', PersonalSpaces, {
  userId: () => Random.id(),
  unsorted: [],
  sorted: [],
});
