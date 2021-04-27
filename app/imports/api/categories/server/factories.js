import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import Categories from '../categories';

Factory.define('categorie', Categories, {
  name: () => Random.id(),
});
