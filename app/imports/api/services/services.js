import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import faker from 'faker';
import slugy from '../../ui/utils/slugy';
import { getLabel } from '../utils';

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
      label: getLabel('api.services.labels.title'),
    },
    slug: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      label: getLabel('api.services.labels.slug'),
      autoValue() {
        const title = this.field('title').value;
        // if name is not being modified, do not calculate autovalue
        if (title === undefined) return undefined;
        const slug = slugy(title);
        return slug;
      },
    },
    team: { type: String, label: getLabel('api.services.labels.team') },
    usage: { type: String, label: getLabel('api.services.labels.usage') },
    content: { type: String, label: getLabel('api.services.labels.content') },
    description: {
      type: String,
      max: 80,
      label: getLabel('api.services.labels.description'),
    },
    url: { type: String, label: getLabel('api.services.labels.url') },
    logo: {
      type: String,
      label: getLabel('api.services.labels.logo'),
    },
    categories: { type: Array, defaultValue: [], label: getLabel('api.services.labels.categories') },
    'categories.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    screenshots: { type: Array, defaultValue: [], label: getLabel('api.services.labels.screenshots') },
    'screenshots.$': { type: String },
  },
  { tracker: Tracker },
);

Services.publicFields = {
  title: 1,
  description: 1,
  url: 1,
  logo: 1,
  categories: 1,
  usage: 1,
  team: 1,
  slug: 1,
};

Services.allPublicFields = {
  ...Services.publicFields,
  screenshots: 1,
  content: 1,
};

Factory.define('service', Services, {
  title: () => Random.id(),
  description: faker.lorem.sentence(),
  url: faker.internet.url(),
  logo: faker.internet.url(),
  team: () => Random.id(),
  usage: () => Random.id(),
  screenshots: [],
  content: faker.lorem.sentence(),
  categories: [],
});

Services.attachSchema(Services.schema);

export default Services;
