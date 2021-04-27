import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { EventsAgenda } from './eventsAgenda';

const fetch = require('node-fetch');

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

  'eventsAgenda.insert': (
    title,
    location,
    startDate,
    endDate,
    allDay,
    participants,
    guests,
    description,
    groups,
    authorId,
  ) => {
    check(title, String);
    check(startDate, String);
    check(endDate, String);
    check(location, String);
    check(allDay, Boolean);
    check(participants, Array);
    check(guests, Array);
    check(description, String);
    check(groups, Array);
    check(authorId, String);
    EventsAgenda.insert({
      title,
      location,
      start: startDate,
      end: endDate,
      allDay,
      participants,
      guests,
      description,
      groups,
      authorId,
    });
  },

  'eventsAgenda.remove': (eventId) => {
    check(eventId, String);
    EventsAgenda.remove(eventId);
  },

  'eventsAgenda.update': (
    eventId,
    title,
    location,
    startDate,
    endDate,
    allDay,
    participants,
    guests,
    description,
    groups,
    authorId,
  ) => {
    check(eventId, String);
    check(title, String);
    check(location, String);
    check(startDate, String);
    check(endDate, String);
    check(allDay, Boolean);
    check(participants, Array);
    check(guests, Array);
    check(description, String);
    check(groups, Array);
    check(authorId, String);
    EventsAgenda.update(eventId, {
      $set: {
        title,
        location,
        start: startDate,
        end: endDate,
        allDay,
        participants,
        guests,
        description,
        groups,
        authorId,
      },
    });
  },

  'eventsAgenda.updateDate': (eventId, startDate, endDate, newAllDay) => {
    check(eventId, String);
    check(startDate, String);
    check(endDate, String);
    check(newAllDay, Boolean);
    EventsAgenda.update(eventId, {
      $set: {
        start: startDate,
        end: endDate,
        allDay: newAllDay,
      },
    });
  },

  'eventsAgenda.updateStatusParticipant': (eventId, participants) => {
    check(eventId, String);
    check(participants, Array);
    EventsAgenda.update(eventId, {
      $set: {
        participants,
      },
    });
  },

  'eventsAgenda.updateStatusGuest': (eventId, guests) => {
    check(eventId, String);
    check(guests, Array);
    EventsAgenda.update(eventId, {
      $set: {
        guests,
      },
    });
  },

  'eventsAgenda.notif': (isAdd, oldParticipants, newParticipants, titleNotif, contentNotif, linkNotif) => {
    check(isAdd, Boolean);
    check(oldParticipants, Array);
    check(newParticipants, Array);
    check(titleNotif, String);
    check(contentNotif, String);
    check(linkNotif, String);
    const url = `${Meteor.settings.public.laboiteUrl}/api/notifications`;
    const dataParticipants = [];
    if (isAdd) {
      newParticipants.forEach((participant) => {
        dataParticipants.push({
          userId: participant.id,
          title: titleNotif,
          content: contentNotif,
          type: 'info',
          link: linkNotif,
        });
      });
    } else if (!isAdd) {
      if (oldParticipants.length === 0 || JSON.stringify(oldParticipants) === JSON.stringify(newParticipants)) {
        newParticipants.forEach((participant) => {
          dataParticipants.push({
            userId: participant.id,
            title: titleNotif,
            content: contentNotif,
            type: 'info',
            link: linkNotif,
          });
        });
      } else {
        newParticipants.forEach((newParticipant) => {
          let canAdd = true;
          oldParticipants.forEach((oldParticipant) => {
            if (newParticipant.id === oldParticipant.id) {
              canAdd = false;
            }
          });
          if (canAdd) {
            dataParticipants.push({
              userId: newParticipant.id,
              title: titleNotif,
              content: contentNotif,
              type: 'info',
              link: linkNotif,
            });
          }
        });
      }
    }
    const responses = [];
    let apiKey = '';
    if (Meteor.settings.private.apiKeys.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      apiKey = Meteor.settings.private.apiKeys[0];
    }
    dataParticipants.forEach((element) => {
      const response = fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(element),
      });
      responses.push(response);
    });
  },
});
