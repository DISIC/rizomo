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
    Services.rawCollection().update(
      {},
      { $unset: { state: true } },
      { multi: true }
    );
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
      .forEach(user => {
        updateInfos = {
          articlesCount: Articles.find({ userId: user._id }).count(),
        };
        if (updateInfos.articlesCount > 0) {
          updateInfos.lastArticle = Articles.findOne(
            { userId: user._id },
            { $sort: { updateAt: -1 } }
          ).updatedAt;
        }
        Meteor.users.update({ _id: user._id }, { $set: updateInfos });
      });
  },
  down: () => {
    Meteor.users
      .rawCollection()
      .update(
        {},
        { $unset: { articlesCount: true, lastArticle: true } },
        { multi: true }
      );
  },
});

Migrations.add({
  version: 3,
  name: 'Add candidates count to groups',
  up: () => {
    Groups.find()
      .fetch()
      .forEach(group => {
        const numCandidates = group.candidates.length;
        Groups.update({ _id: group._id }, { $set: { numCandidates } });
      });
  },
  down: () => {
    Groups.rawCollection().update(
      {},
      { $unset: { numCandidates: true } },
      { multi: true }
    );
  },
});
