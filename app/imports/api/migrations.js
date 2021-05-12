import { Migrations } from 'meteor/percolate:migrations';
import { Meteor } from 'meteor/meteor';
import Articles from './articles/articles';
import Services from './services/services';
import Groups from './groups/groups';
import Tags from './tags/tags';
import logServer from './logging';

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

Migrations.add({
  version: 8,
  name: 'No update here (kept for compatibility)',
  up: () => {
    // nothing to do here, wrong code previsouly added by mistake
    // Articles.update({}, { $set: { tags: [] } }, { multi: true });
  },
  down: () => {
    // nothing to do here, wrong code previsouly added by mistake
    // Articles.rawCollection().updateMany({}, { $unset: { tags: true } });
  },
});

Migrations.add({
  version: 9,
  name: 'Add author structure to articles',
  up: () => {
    Articles.find({})
      .fetch()
      .forEach((article) => {
        const updateData = {};
        // set article structure when possible
        if (article.structure === undefined || article.structure === '') {
          const author = Meteor.users.findOne({ _id: article.userId }, { fields: { structure: 1 } });
          if (author) {
            updateData.structure = author.structure || '';
          } else {
            logServer(`Migration: could not find author ${article.userId} for article ${article._id}`);
          }
        }
        // store tag name in articles instead of _id
        const newTags = [];
        if (article.tags) {
          article.tags.forEach((tagId) => {
            const tag = Tags.findOne(tagId);
            if (tag && !newTags.includes(tag.name.toLowerCase())) {
              // add and force tag to lower case
              newTags.push(tag.name.toLowerCase());
            }
          });
          updateData.tags = newTags;
        }
        if (Object.keys(updateData).length > 0) {
          Articles.update({ _id: article._id }, { $set: updateData });
        }
      });
    // update Tags collection to be lowercase only
    Tags.find({})
      .fetch()
      .forEach((tag) => {
        const tagName = tag.name.toLowerCase();
        if (tag.name !== tagName) {
          if (Tags.findOne({ name: tagName })) {
            // tag names are unique, remove if lowercase version exists
            Tags.remove({ _id: tag._id });
          } else {
            // otherwise, update tag
            Tags.update({ _id: tag._id }, { $set: { name: tagName } });
          }
        }
      });
  },
  down: () => {
    Articles.rawCollection().updateMany({}, { $unset: { structure: true } });
    Articles.find({})
      .fetch()
      .forEach((article) => {
        // store back tag _id (unknown tags are removed to prevent schema check errors)
        const newTags = [];
        if (article.tags) {
          article.tags.forEach((tagName) => {
            const tag = Tags.findOne({ name: tagName });
            if (tag) newTags.push(tag._id);
          });
        }
        Articles.update({ _id: article._id }, { $set: { tags: newTags } });
      });
  },
});

Migrations.add({
  version: 10,
  name: 'Add articles boolean to groups with articles',
  up: () => {
    const articles = Articles.find({ groups: { $exists: true } }).fetch();
    articles.forEach(({ groups }) => {
      groups.forEach(({ _id }) => {
        Groups.update({ _id }, { $set: { articles: true } });
      });
    });
  },
  down: () => {
    Groups.rawCollection().updateMany({}, { $unset: { articles: true } });
  },
});

Migrations.add({
  version: 11,
  name: 'Add structure to services',
  up: () => {
    Services.update({}, { $set: { structure: '' } }, { multi: true });
  },
  down: () => {
    Services.rawCollection().updateMany({}, { $unset: { structure: true } });
  },
});
