/* eslint-disable func-names */
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import slugy from '../../ui/utils/slugy';
import { getLabel } from '../utils';
import Groups from '../groups/groups';

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
    draft: {
      type: Boolean,
      label: getLabel('api.articles.labels.draft'),
      defaultValue: false,
      optional: true,
    },
    structure: {
      type: String,
      label: getLabel('api.articles.labels.structure'),
    },
    markdown: { type: Boolean, label: getLabel('api.articles.labels.markdown'), defaultValue: false },
    content: { type: String, label: getLabel('api.articles.labels.content'), min: 1 },
    description: { type: String, label: getLabel('api.articles.labels.description'), max: 400 },
    tags: { type: Array, defaultValue: [], label: getLabel('api.articles.labels.tag') },
    'tags.$': { type: String, min: 1 },
    groups: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.articles.labels.groups'),
    },
    'groups.$': {
      type: { type: Object },
    },
    'groups.$._id': {
      type: { type: String, regEx: SimpleSchema.RegEx.Id },
    },
    'groups.$.name': {
      type: { type: String },
    },
    createdAt: {
      type: Date,
      label: getLabel('api.articles.labels.createdAt'),
      optional: true,
      autoValue() {
        if ((this.isInsert && this.field('draft').value === false) || (!this.isInsert && !this.value)) {
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
  draft: 1,
  content: 1,
  createdAt: 1,
  updatedAt: 1,
  description: 1,
  groups: 1,
  markdown: 1,
  visits: 1,
  tags: 1,
  structure: 1,
};

Articles.attachSchema(Articles.schema);

if (Meteor.isServer) {
  const updateGroupWithArticles = (doc, remove) => {
    if (doc.groups) {
      doc.groups.forEach(({ _id }) => {
        if (remove) {
          const isThereStillArticles = Articles.findOne({ 'groups._id': _id });
          if (!isThereStillArticles) {
            Groups.update({ _id }, { $set: { articles: false } });
          }
        } else {
          Groups.update({ _id }, { $set: { articles: true } });
        }
      });
    }
  };

  Articles.after.insert(function (userId, doc) {
    updateGroupWithArticles(doc, false);
  });
  Articles.after.update(function (userId, doc) {
    updateGroupWithArticles(doc, false);
  });
  Articles.after.remove(function (userId, doc) {
    updateGroupWithArticles(doc, true);
  });
}

export default Articles;
