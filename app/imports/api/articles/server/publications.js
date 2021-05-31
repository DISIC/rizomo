import { Meteor } from 'meteor/meteor';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { publishComposite } from 'meteor/reywood:publish-composite';
import SimpleSchema from 'simpl-schema';
import logServer from '../../logging';
import Tags from '../../tags/tags';
import { checkPaginationParams, getLabel } from '../../utils';
import Articles from '../articles';

// build query for all articles
const queryAllArticles = ({ nodrafts, search, userId }) => {
  const regex = new RegExp(search, 'i');
  const query = {
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
  if (nodrafts) {
    query.draft = { $ne: true };
  }
  return query;
};

Meteor.methods({
  'get_articles.all_count': function getArticlesAllCount({ nodrafts, search, userId }) {
    try {
      const query = queryAllArticles({ nodrafts, search, userId: userId || this.userId });
      return Articles.find(query).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all existing articles
FindFromPublication.publish(
  'articles.all',
  function articlesAll({ nodrafts, page, search, itemPerPage, userId, ...rest }) {
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

    try {
      const query = queryAllArticles({ nodrafts, search, userId: userId || this.userId });

      return Articles.find(query, {
        fields: Articles.publicFields,
        skip: itemPerPage * (page - 1),
        limit: itemPerPage,
        sort: { createdAt: -1 },
        ...rest,
      });
    } catch (error) {
      return this.ready();
    }
  },
);

// publish one article based on its slug
FindFromPublication.publish('articles.one.admin', ({ slug }) => {
  try {
    new SimpleSchema({
      slug: {
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

publishComposite('articles.one', ({ slug }) => {
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.articles.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`publish articles.one : ${err}`);
    this.error(err);
  }
  return {
    find() {
      // Find top ten highest scoring posts
      return Articles.find(
        { slug },
        {
          fields: Articles.PublicFields,
          limit: 1,
          sort: { name: -1 },
        },
      );
    },
    children: [
      {
        find({ tags = [] }) {
          // Find asssociated tags
          return Tags.find({ _id: { $in: tags } }, { fields: Tags.publicFields, sort: { name: 1 }, limit: 1000 });
        },
      },
    ],
  };
});
