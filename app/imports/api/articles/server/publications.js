import { Meteor } from 'meteor/meteor';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
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
FindFromPublication.publish('articles.one', ({ slug = '' }) =>
  Articles.find(
    { slug },
    {
      fields: Articles.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  ),
);
