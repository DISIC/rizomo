import { Migrations } from 'meteor/percolate:migrations';
import { Meteor } from 'meteor/meteor';
import Articles from './articles/articles';
import Services from './services/services';
import Groups from './groups/groups';

Migrations.add({
  version: 1,
  name: 'Add state field to services',
  up: () => {
    Services.update({ state: null }, { $set: { state: 0 } }, { multi: true });
  },
  down: () => {
    Services.rawCollection().updateMany({}, { $unset: { state: true } });
  },
});

Migrations.add({
  version: 2,
  name: 'Add articles count and last publication date to users',
  up: () => {
    let updateInfos = {};
    Meteor.users
      .find()
      .fetch()
      .forEach((user) => {
        updateInfos = {
          articlesCount: Articles.find({ userId: user._id }).count(),
        };
        if (updateInfos.articlesCount > 0) {
          updateInfos.lastArticle = Articles.findOne({ userId: user._id }, { $sort: { updateAt: -1 } }).updatedAt;
        }
        Meteor.users.update({ _id: user._id }, { $set: updateInfos });
      });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { articlesCount: true, lastArticle: true } });
  },
});

Migrations.add({
  version: 3,
  name: 'Add candidates count to groups',
  up: () => {
    Groups.find()
      .fetch()
      .forEach((group) => {
        const numCandidates = group.candidates.length;
        Groups.update({ _id: group._id }, { $set: { numCandidates } });
      });
  },
  down: () => {
    Groups.rawCollection().updateMany({}, { $unset: { numCandidates: true } });
  },
});

Migrations.add({
  version: 4,
  name: 'Add visit count to articles',
  up: () => {
    Articles.update({}, { $set: { visits: 0 } }, { multi: true });
  },
  down: () => {
    Articles.rawCollection().updateMany({}, { $unset: { visits: true } });
  },
});

Migrations.add({
  version: 5,
  name: 'Add nextcloud setting to groups',
  up: () => {
    if (Groups.schema._schemaKeys.includes('nextcloud')) {
      Groups.update({}, { $set: { nextcloud: false } }, { multi: true });
    }
  },
  down: () => {
    Groups.rawCollection().updateMany({}, { $unset: { nextcloud: true } });
  },
});

Migrations.add({
  version: 6,
  name: 'Add plugins setting to groups and remove nextcloud',
  up: () => {
    Groups.update({}, { $set: { plugins: {} } }, { multi: true });
    Groups.update(
      { nextcloud: true },
      { $set: { plugins: { nextcloud: { enable: true } } }, $unset: { nextcloud: true } },
      { multi: true },
    );
  },
  down: () => {
    Groups.rawCollection().updateMany({ plugins: { nextcloud: { enable: true } } }, { $set: { nextcloud: true } });
    Groups.rawCollection().updateMany({}, { $unset: { plugins: true } });
  },
});

Migrations.add({
  version: 7,
  name: 'Add tags list to articles',
  up: () => {
    Articles.update({}, { $set: { tags: [] } }, { multi: true });
  },
  down: () => {
    Articles.rawCollection().updateMany({}, { $unset: { tags: true } });
  },
});
