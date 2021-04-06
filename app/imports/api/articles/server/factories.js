import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import Articles from '../articles';

Factory.define('article', Articles, {
  title: () => Random.id(),
  content: faker.lorem.sentence(),
  description: faker.lorem.sentence(),
  userId: () => Random.id(),
  structure: () => faker.company.companyName(),
});
