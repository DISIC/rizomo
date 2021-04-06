import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';

import AppSettings from '../appsettings';

Factory.define('appsettings', AppSettings, {
  introduction: [
    {
      language: 'en',
      content: faker.lorem.sentences(),
    },
    {
      language: 'fr',
      content: faker.lorem.sentences(),
    },
  ],
  legal: {
    external: Boolean(Math.random() * 2),
    link: faker.lorem.slug(),
    content: faker.lorem.sentences(),
  },
  accessibility: {
    external: Boolean(Math.random() * 2),
    link: faker.lorem.slug(),
    content: faker.lorem.sentences(),
  },
  gcu: {
    external: Boolean(Math.random() * 2),
    link: faker.lorem.slug(),
    content: faker.lorem.sentences(),
  },
  personalData: {
    external: Boolean(Math.random() * 2),
    link: faker.lorem.slug(),
    content: faker.lorem.sentences(),
  },
});
