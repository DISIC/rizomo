import { Mongo } from 'meteor/mongo';
//  import { Factory } from 'meteor/dburles:factory';

export const EventsAgenda = new Mongo.Collection('eventsAgenda');

EventsAgenda.deny({
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

EventsAgenda.publicFields = {
  title: 1,
  location: 1,
  description: 1,
  start: 1,
  end: 1,
  allDay: 1,
  group: 1,
  participants: 1,
  guests: 1,
  userId: 1,
};

// Factory.define('eventsAgenda', EventsAgenda, {});

EventsAgenda.attachSchema(EventsAgenda.schema);

export default EventsAgenda;
