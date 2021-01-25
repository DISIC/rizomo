import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import Articles from '../../../api/articles/articles';
import logServer from '../../../api/logging';

const users = (number) => {
  const limit = Math.floor(Math.random() * number);
  const skip = Math.floor(Math.random() * 1000);
  return Meteor.users.find({}, { limit, skip, fields: { _id: 1, structure: 1 } }).map(({ _id, structure }) => {
    return {
      userId: _id,
      structure,
    };
  });
};

/** When running app for first time, pass a settings file to set up default groups. */
if (Articles.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData && Meteor.isDevelopment) {
    const PUBLISHERS_RANDOM = 100;
    const publishers = users(PUBLISHERS_RANDOM);
    logServer('Creating the default articles.');
    publishers.forEach(({ userId, structure }) => {
      const array = new Array(Math.floor(Math.random() * 30));
      array.fill(0);
      array.forEach(() => {
        const title = faker.lorem.sentence();
        logServer(`Creating article ${title} for user ${userId}.`);
        Articles.insert({
          userId,
          structure,
          title,
          description: faker.lorem.paragraph(),
          content: faker.lorem.paragraphs(),
        });
      });
    });
  }
}
