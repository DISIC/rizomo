import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import faker from 'faker';
import slugy from '../../ui/utils/slugy';
import { getLabel } from '../utils';

const Articles = new Mongo.Collection('articles');

// Deny all client-side updates since we will be using methods to manage this collection
Articles.deny({
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

Articles.schema = new SimpleSchema(
  {
    title: {
      type: String,
      min: 1,
      label: getLabel('api.articles.labels.title'),
    },
    slug: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      label: getLabel('api.articles.labels.slug'),
      autoValue() {
        const title = this.field('title').value;
        // if name is not being modified, do not calculate autovalue
        if (title === undefined) return undefined;
        if (this.isInsert) {
          const date = new Date();
          const slug = slugy(`${title}_${date.toISOString()}`);
          return slug;
        }
        return this.value;
      },
    },
    userId: {
      type: String,
      label: getLabel('api.articles.labels.userId'),
    },
    structure: {
      type: String,
      label: getLabel('api.articles.labels.structure'),
    },
    markdown: { type: Boolean, label: getLabel('api.articles.labels.markdown'), defaultValue: false },
    content: { type: String, label: getLabel('api.articles.labels.content'), min: 1 },
    description: { type: String, label: getLabel('api.articles.labels.description'), max: 400 },
    tags: { type: Array, defaultValue: [], label: getLabel('api.articles.labels.tag') },
    'tags.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    createdAt: {
      type: Date,
      label: getLabel('api.articles.labels.createdAt'),
      autoValue() {
        if (this.isInsert) {
          return new Date();
        }
        return this.value;
      },
    },
    updatedAt: {
      type: Date,
      label: getLabel('api.articles.labels.updatedAt'),
      autoValue() {
        return new Date();
      },
    },
    visits: {
      type: SimpleSchema.Integer,
      defaultValue: 0,
    },
  },
  { clean: { removeEmptyStrings: false }, tracker: Tracker },
);

Articles.publicFields = {
  title: 1,
  slug: 1,
  userId: 1,
  content: 1,
  createdAt: 1,
  updatedAt: 1,
  description: 1,
  markdown: 1,
  visits: 1,
  tags: 1,
};

Factory.define('article', Articles, {
  title: () => Random.id(),
  content: faker.lorem.sentence(),
  description: faker.lorem.sentence(),
  userId: () => Random.id(),
  structure: () => faker.company.companyName(),
});

Articles.attachSchema(Articles.schema);

export default Articles;
