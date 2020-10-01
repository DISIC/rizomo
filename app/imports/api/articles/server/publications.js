import { Meteor } from 'meteor/meteor';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import SimpleSchema from 'simpl-schema';
import logServer from '../../logging';
import { checkPaginationParams, getLabel } from '../../utils';
import Articles from '../articles';

// build query for all articles
const queryAllArticles = ({ search, userId }) => {
  const regex = new RegExp(search, 'i');
  return {
    userId,
    $or: [
      {
        title: { $regex: regex },
      },
      {
        content: { $regex: regex },
      },
    ],
  };
};

Meteor.methods({
  'get_articles.all_count': function getArticlesAllCount({ search, userId }) {
    const query = queryAllArticles({ search, userId: userId || this.userId });
    return Articles.find(query).count();
  },
});

// publish all existing articles
FindFromPublication.publish('articles.all', function articlesAll({ page, search, itemPerPage, userId, ...rest }) {
  try {
    new SimpleSchema({
      userId: {
        optional: true,
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        label: getLabel('api.users.labels.id'),
      },
    })
      .extend(checkPaginationParams)
      .validate({ page, itemPerPage, userId, search });
  } catch (err) {
    logServer(`publish articles.all : ${err}`);
    this.error(err);
  }
  const query = queryAllArticles({ search, userId: userId || this.userId });

  return Articles.find(query, {
    fields: Articles.publicFields,
    skip: itemPerPage * (page - 1),
    limit: itemPerPage,
    sort: { createdAt: -1 },
    ...rest,
  });
});

// publish one article based on its slug
FindFromPublication.publish('articles.one', ({ slug = '' }) => {
  try {
    new SimpleSchema({
      slug: {
        optional: true,
        type: String,
        label: getLabel('api.articles.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`publish articles.one : ${err}`);
    this.error(err);
  }
  return Articles.find(
    { slug },
    {
      fields: Articles.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  );
});
