import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Events = new Mongo.Collection('events');

// Deny all client-side updates since we will be using methods to manage this collection
Events.deny({
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

Events.schema = new SimpleSchema(
  {
    title: { type: String, label: getLabel('api.events.labels.title') },
    startsAt: { type: Date, label: getLabel('api.events.labels.startsAt') },
    endsAt: { type: Date, label: getLabel('api.events.labels.endsAt') },
    allDay: { type: Boolean, label: getLabel('api.events.labels.allDay') },
    description: { type: String, label: getLabel('api.events.labels.description') },
    location: { type: String, label: getLabel('api.events.labels.location') },
    group: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.events.labels.groupId'),
    },
    eventPadID: { type: String, label: getLabel('api.events.labels.eventPadId') },
    participants: Array,
    'participants.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.events.labels.participantId'),
    },
  },
  { tracker: Tracker },
);

Events.attachSchema(Events.schema);

Events.helpers({
  getParticipants() {
    return Meteor.users.find({ _id: { $in: this.participants } });
  },
});

export default Events;
