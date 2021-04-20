import { Mongo } from 'meteor/mongo';

export const Polls = new Mongo.Collection('polls');

// Deny all client-side updates since we will be using methods to manage this collection
Polls.deny({
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

Polls.publicFields = {
  title: 1,
  userId: 1,
  content: 1,
  groups: 1,
  public: 1,
  allDay: 1,
  createdAt: 1,
  updatedAt: 1,
  description: 1,
  dates: 1,
};

Polls.attachSchema(Polls.schema);

export default Polls;
