import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import faker from 'faker';
import { getLabel } from '../utils';

const Notifications = new Mongo.Collection('notifications');

// Deny all client-side updates since we will be using methods to manage this collection
Notifications.deny({
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

Notifications.schema = new SimpleSchema(
  {
    userId: {
      type: String,
      label: getLabel('api.notifications.labels.userId'),
    },
    title: { type: String, optional: true, label: getLabel('api.notifications.labels.title') },
    content: { type: String, optional: true, label: getLabel('api.notifications.labels.content') },
    type: {
      type: String,
      label: getLabel('api.notifications.labels.type'),
    },
    createdAt: {
      type: Date,
      label: getLabel('api.notifications.labels.createdAt'),
      autoValue() {
        if (this.isInsert) {
          return new Date();
        }
        return this.value;
      },
    },
    read: { type: Boolean, defaultValue: false, label: getLabel('api.notifications.labels.read') },
  },
  { tracker: Tracker },
);

Notifications.publicFields = {
  userId: 1,
  title: 1,
  content: 1,
  type: 1,
  createdAt: 1,
  read: 1,
};

Factory.define('notification', Notifications, {
  userId: () => Random.id(),
  title: faker.lorem.words(),
  content: faker.lorem.sentences(2),
  type: 'info',
});

Notifications.attachSchema(Notifications.schema);

export default Notifications;
