import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Switch from '@material-ui/core/Switch';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@material-ui/icons/ArrowBack';
import MaterialTable from 'material-table';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import LanguageIcon from '@material-ui/icons/Language';
import Container from '@material-ui/core/Container';
import { Roles } from 'meteor/alanning:roles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import add from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { removeBookmark, updateBookmark } from '../../../api/bookmarks/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import BookMarkEdit from '../../components/groups/BookMarkEdit';
import Bookmarks from '../../../api/bookmarks/bookmarks';
import Groups from '../../../api/groups/groups';

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

function BookmarksPage({ loading, bookmarksList, group }) {
  const [{ userId }] = useAppContext();
  const history = useHistory();
  const [filter, setFilter] = useState(false);
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

  const bookmarksListFinal = bookmarksList.filter((bookmark) => bookmark.author === userId);

  const OpenURLEditor = () => setEditUrl(true);

  const filterOnURL = () => setFilter(!filter);

  const userInGroup = (checkId) => {
    return Roles.userIsInRole(checkId, ['member', 'animator', 'admin'], group._id);
  };

  const goBack = () => {
    history.goBack();
  };

  const hideEditActions = (checkId) => {
    return !(
      checkId === userId ||
      Roles.userIsInRole(userId, 'admin', group._id) ||
      Roles.userIsInRole(userId, 'admin')
    );
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
      ) : userInGroup(userId) ? (
        <div>
          <Container style={{ overflowX: 'auto' }}>
            <Grid className={classes.goBackButton} item xs={12} sm={12} md={12}>
              <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
                {i18n.__('pages.Polls.back')}
              </Button>
            </Grid>
            <FormControlLabel
              value="start"
              control={
                <Tooltip
                  title={
                    filter
                      ? `${i18n.__('pages.BookmarksPage.disableFilter')}`
                      : `${i18n.__('pages.BookmarksPage.enableFilter')}`
                  }
                >
                  <Switch
                    checked={filter}
                    onChange={filterOnURL}
                    color="primary"
                    name="checkedB"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                </Tooltip>
              }
              label={i18n.__('pages.BookmarksPage.filterTitle')}
              labelPlacement="start"
            />
            <MaterialTable
              // other props
              title={`${i18n.__('pages.BookmarksPage.title')}`}
              columns={columns}
              data={filter ? bookmarksListFinal : bookmarksList}
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
              ]}
              editable={{
                isDeleteHidden: (rowData) => hideEditActions(rowData.author),
                isEditHidden: (rowData) => hideEditActions(rowData.author),
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                    updateBookmark.call(
                      {
                        id: oldData._id,
                        url: newData.url,
                        name: newData.name,
                        tag: newData.tag,
                        groupId: group._id,
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
                    Meteor.call('bookmark.getFavicon', { url: newData.url });
                  }),
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
                    removeBookmark.call(
                      {
                        url: oldData.url,
                        groupId: group._id,
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
            <BookMarkEdit
              data={bkData}
              group={group}
              onEdit={onEdit}
              open={editUrl}
              onClose={() => setEditUrl(false)}
            />
          ) : null}
        </div>
      ) : (
        <p className={classes.ErrorPage}>{i18n.__('pages.BookmarksPage.noAccess')}</p>
      )}
    </>
  );
}

BookmarksPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  bookmarksList: PropTypes.arrayOf(PropTypes.object).isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    const subGroup = Meteor.subscribe('groups.single', { slug });
    const group = Groups.findOne({ slug }) || {};
    const bookmarksHandle = Meteor.subscribe('bookmark.group.all', { groupId: group._id });
    const bookmarksList = Bookmarks.find({ groupId: group._id }, { sort: { name: 1 } }).fetch();
    const loading = !bookmarksHandle.ready() || !subGroup.ready();
    return {
      loading,
      bookmarksList,
      group,
    };
  },
)(BookmarksPage);
