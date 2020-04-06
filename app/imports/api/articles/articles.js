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
        const slug = slugy(title);
        return slug;
      },
    },
    userId: {
      type: String,
      label: getLabel('api.articles.labels.userId'),
    },
    content: { type: String, label: getLabel('api.articles.labels.content') },
    description: { type: String, label: getLabel('api.articles.labels.description'), max: 400 },
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
  },
  { tracker: Tracker },
);

Articles.publicFields = {
  title: 1,
  slug: 1,
  userId: 1,
  content: 1,
  createdAt: 1,
  updatedAt: 1,
  description: 1,
};

Factory.define('article', Articles, {
  title: () => Random.id(),
  content: faker.lorem.sentence(),
});

Articles.attachSchema(Articles.schema);

export default Articles;
