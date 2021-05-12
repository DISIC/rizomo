import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import Services from '../services';

Factory.define('service', Services, {
  title: () => Random.id(),
  description: faker.lorem.sentence().substring(0, 80),
  url: faker.internet.url(),
  logo: faker.internet.url(),
  team: () => Random.id(),
  usage: () => Random.id(),
  screenshots: [],
  content: faker.lorem.sentence(),
  categories: [],
  state: 0,
  structure: '',
});
