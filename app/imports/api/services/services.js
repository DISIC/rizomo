import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import faker from 'faker';
import { fileUpload } from '../../ui/utils/filesProcess';
import slugy from '../../ui/utils/slugy';

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
        const slug = slugy(title);
        return slug;
      },
    },
    team: String,
    usage: String,
    content: String,
    description: {
      type: String,
      max: 80,
    },
    url: String,
    logo: {
      type: String,
      autoValue() {
        if (this.value) {
          return fileUpload({
            name: `logo_${Random.id()}`,
            file: this.value,
            path: `services/${this.docId}/`,
          });
        }
        return undefined;
      },
    },
    categories: { type: Array, defaultValue: [] },
    'categories.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    screenshots: { type: Array, defaultValue: [] },
    'screenshots.$': {
      type: String,
      autoValue() {
        if (this.value) {
          return fileUpload({
            name: `screenshot_${Random.id()}`,
            file: this.value,
            path: `services/${this.docId}/`,
          });
        }
        return undefined;
      },
    },
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
  slug: () => Random.id(),
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
