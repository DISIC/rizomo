import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { EventsAgenda } from './eventsAgenda';

Meteor.methods({
  'eventsAgenda.getEventsWithTitleDateAuthor': (_title, startDate, endDate, author) => {
    check(_title, String);
    check(startDate, String);
    check(endDate, String);
    check(author, String);
    return EventsAgenda.find({ title: _title, start: startDate, end: endDate, authorId: author }).fetch();
  },

  'eventsAgenda.getEventById': (id) => {
    check(id, String);
    return EventsAgenda.find({ _id: id }).fetch();
  },
});
