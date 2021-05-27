import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
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
    state: {
      type: SimpleSchema.Integer,
      allowedValues: [0, 5, 10], // 0 displayed, 5 inactive, 10 invisible
      label: getLabel('api.services.labels.state'),
    },
    categories: { type: Array, defaultValue: [], label: getLabel('api.services.labels.categories') },
    'categories.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    screenshots: { type: Array, defaultValue: [], label: getLabel('api.services.labels.screenshots') },
    'screenshots.$': { type: String },
    structure: {
      type: String,
      index: true,
      label: getLabel('api.services.labels.structure'),
      defaultValue: '',
    },
  },
  { clean: { removeEmptyStrings: false }, tracker: Tracker },
);

Services.stateLabels = {
  0: 'api.services.states.displayed',
  5: 'api.services.states.inactive',
  10: 'api.services.states.invisible',
};

Services.publicFields = {
  title: 1,
  description: 1,
  url: 1,
  logo: 1,
  categories: 1,
  usage: 1,
  team: 1,
  slug: 1,
  state: 1,
  structure: 1,
};

Services.allPublicFields = {
  ...Services.publicFields,
  screenshots: 1,
  content: 1,
};

Services.attachSchema(Services.schema);

export default Services;
