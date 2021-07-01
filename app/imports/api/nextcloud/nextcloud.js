import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Nextcloud = new Mongo.Collection('nextcloud');

// Deny all client-side updates since we will be using methods to manage this collection
Nextcloud.deny({
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

Nextcloud.schema = new SimpleSchema(
  {
    url: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      max: 256,
      label: getLabel('api.nextcloud.labels.url'),
    },
    active: { type: Boolean, label: getLabel('api.nextcloud.labels.active') },
    count: {
      type: SimpleSchema.Integer,
      defaultValue: 0,
      label: getLabel('api.nextcloud.labels.count'),
    },
  },
  { tracker: Tracker },
);

Nextcloud.publicFields = {
  url: 1,
  active: 1,
  count: 1,
};

Nextcloud.attachSchema(Nextcloud.schema);

export default Nextcloud;
