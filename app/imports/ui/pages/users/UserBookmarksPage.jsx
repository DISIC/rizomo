import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@material-ui/icons/ArrowBack';
import MaterialTable from '@material-table/core';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import LanguageIcon from '@material-ui/icons/Language';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';
import Container from '@material-ui/core/Container';
import { Roles } from 'meteor/alanning:roles';
import add from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { removeUserBookmark, updateUserBookmark } from '../../../api/userBookmarks/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import UserBookMarkEdit from '../../components/users/UserBookmarkEdit';
import UserBookmarks from '../../../api/userBookmarks/userBookmarks';

const useStyles = makeStyles(() => ({
  ErrorPage: {
    textAlign: 'center',
  },
  goBackButton: {
    marginBottom: 30,
  },
  link: {
    color: 'blue',
    textDecoration: 'underline',
  },
  icon: {
    height: 25,
    width: 25,
  },
}));

function UserBookmarksPage({ loading, bookmarksList }) {
  const [{ user, userId }] = useAppContext();
  const history = useHistory();
  const classes = useStyles();
  const columns = [
    {
      title: i18n.__('pages.BookmarksPage.columnIcon'),
      field: 'icon',
      editable: 'never',
      render: (rowData) => {
        const { icon } = rowData;

        if (icon !== '') {
          // eslint-disable-next-line jsx-a11y/alt-text
          return <img src={`${icon}`} className={classes.icon} />;
        }
        return <LanguageIcon className={classes.icon} />;
      },
    },
    {
      title: i18n.__('pages.BookmarksPage.columnName'),
      field: 'name',
    },
    {
      title: i18n.__('pages.BookmarksPage.columnUrl'),
      field: 'url',
      render: (rowData) => {
        const { url } = rowData;
        return (
          <a href={url} className={classes.link} target="_blank" rel="noreferrer noopener">
            {url}
          </a>
        );
      },
    },
    {
      title: i18n.__('pages.BookmarksPage.columnTag'),
      field: 'tag',
    },
  ];

  const [editUrl, setEditUrl] = useState(false);
  const [bkData, setBkData] = useState({});
  const [onEdit, setOnEdit] = useState(false);

  const OpenURLEditor = () => setEditUrl(true);

  const goBack = () => {
    history.goBack();
  };

  const hideEditActions = (checkId) => {
    return !(checkId === userId || Roles.userIsInRole(userId, 'admin'));
  };

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 6,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <Container style={{ overflowX: 'auto' }}>
            <Grid className={classes.goBackButton} item xs={12} sm={12} md={12}>
              <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
                {i18n.__('pages.UserBookmarksPage.back')}
              </Button>
            </Grid>
            <MaterialTable
              // other props
              title={`${i18n.__('pages.BookmarksPage.title')}`}
              columns={columns}
              data={bookmarksList.map((row) => {
                return { ...row, id: row._id };
              })}
              options={options}
              localization={setMaterialTableLocalization('pages.BookmarksPage')}
              actions={[
                {
                  icon: add,
                  tooltip: i18n.__('pages.BookmarksPage.materialTableLocalization.body_addTooltip'),
                  isFreeAction: true,
                  onClick: () => {
                    setOnEdit(false);
                    setBkData({});
                    OpenURLEditor();
                  },
                },
                (rowData) => {
                  const isFavorite = user.favUserBookmarks.indexOf(rowData._id) !== -1;
                  return {
                    icon: () => (isFavorite ? <StarIcon /> : <StarBorderIcon />),
                    tooltip: i18n.__(
                      `pages.UserBookmarksPage.${isFavorite ? 'unfavoriteBookmark' : 'favoriteBookmark'}`,
                    ),
                    onClick: () => {
                      Meteor.call(
                        `userBookmarks.${isFavorite ? 'unfavUserBookmark' : 'favUserBookmark'}`,
                        { bookmarkId: rowData._id },
                        (err) => {
                          if (err) {
                            msg.error(err.reason);
                          }
                        },
                      );
                    },
                  };
                },
              ]}
              editable={{
                isDeleteHidden: (rowData) => hideEditActions(rowData.userId),
                isEditHidden: (rowData) => hideEditActions(rowData.userId),
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                    updateUserBookmark.call(
                      {
                        id: oldData._id,
                        url: newData.url,
                        name: newData.name,
                        tag: newData.tag,
                      },
                      (err, res) => {
                        if (err) {
                          msg.error(err.reason);
                          reject(err);
                        } else {
                          msg.success(i18n.__('api.methods.operationSuccessMsg'));
                          resolve(res);
                        }
                      },
                    );
                    Meteor.call('userBookmark.getFavicon', { url: newData.url });
                  }),
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
                    removeUserBookmark.call(
                      {
                        id: oldData._id,
                      },
                      (err, res) => {
                        if (err) {
                          msg.error(err.reason);
                          reject(err);
                        } else {
                          msg.success(i18n.__('api.methods.operationSuccessMsg'));
                          resolve(res);
                        }
                      },
                    );
                  }),
              }}
            />
          </Container>
          {editUrl ? (
            <UserBookMarkEdit data={bkData} onEdit={onEdit} open={editUrl} onClose={() => setEditUrl(false)} />
          ) : null}
        </div>
      )}
    </>
  );
}

UserBookmarksPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  bookmarksList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withTracker(() => {
  const [{ userId }] = useAppContext();
  const bookmarksHandle = Meteor.subscribe('bookmark.user.all', { userId });
  const bookmarksList = UserBookmarks.find({ userId }, { sort: { name: 1 } }).fetch();
  const loading = !bookmarksHandle.ready();
  return {
    loading,
    bookmarksList,
  };
})(UserBookmarksPage);
