import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import faker from 'faker';
import slugify from 'slugify';

const Services = new Mongo.Collection('services');

// Deny all client-side updates since we will be using methods to manage this collection
Services.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

Services.schema = new SimpleSchema(
  {
    title: {
      type: String,
      min: 1,
    },
    slug: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      autoValue() {
        const title = this.field('title').value;
        const slug = slugify(title, {
          replacement: '-', // replace spaces with replacement
          remove: null, // regex to remove characters
          lower: true, // result in lower case
        });
        return slug;
      },
    },
    team: {
      type: String,
      defaultValue: '',
    },
    content: {
      type: String,
      defaultValue: '',
    },
    description: String,
    url: String,
    logo: String,
    categories: { type: Array, defaultValue: [] },
    'categories.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    screenshots: { type: Array, defaultValue: [] },
    'screenshots.$': String,
  },
  { tracker: Tracker },
);

Services.publicFields = {
  title: 1,
  description: 1,
  url: 1,
  logo: 1,
  categories: 1,
  team: 1,
};

Services.allPublicFields = {
  ...Services.publicFields,
  screenshots: 1,
  content: 1,
  slug: 1,
};

Factory.define('service', Services, {
  title: () => Random.id(),
  slug: () => Random.id(),
  description: faker.lorem.sentence(),
  url: faker.internet.url(),
  logo: faker.internet.url(),
  team: () => Random.id(),
  screenshots: [],
  content: faker.lorem.sentence(),
  categories: [],
});

Services.attachSchema(Services.schema);

export default Services;
