import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import Tags from '../tags';

Factory.define('tag', Tags, {
  name: () => Random.id().toLowerCase(),
});
