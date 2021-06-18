import { Meteor } from 'meteor/meteor';
import { structures } from '../../users/structures';
import Groups from '../../groups/groups';
import Articles from '../../articles/articles';

export default async function getStats() {
  // sample use:
  // curl -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" http://localhost:3000/api/stats | jq
  const ret = {};

  // Date
  ret.date = new Date().toISOString();

  // usersByStructure
  ret.usersByStructure = {};
  structures.forEach((s) => {
    try {
      ret.usersByStructure[s] = Meteor.users.find({ structure: s }).count();
    } catch (error) {
      ret.usersByStructure[s] = 'NA';
    }
  });

  // users
  try {
    ret.users = Meteor.users.find({}).count();
  } catch (error) {
    ret.users = 'NA';
  }

  // groups
  try {
    ret.groups = Groups.find({}).count();
  } catch (error) {
    ret.groups = 'NA';
  }

  // authors + articles
  try {
    const allArticles = Articles.find({}, { fields: { _id: 0, userId: 1 } }).fetch();
    ret.articles = allArticles.length;
    ret.authors = new Set(allArticles.map((u) => u.userId)).size;
  } catch (error) {
    ret.articles = 'NA';
    ret.authors = 'NA';
  }

  return ret;
}
