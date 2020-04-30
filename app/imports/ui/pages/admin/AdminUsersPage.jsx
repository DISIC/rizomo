import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@material-ui/core/ListItemText';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import {
  makeStyles, Divider, Tooltip, TextField, InputAdornment,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import DeleteIcon from '@material-ui/icons/Delete';
import Pagination from '@material-ui/lab/Pagination';
import { usePagination } from '../../utils/hooks';
import Spinner from '../../components/system/Spinner';
import debounce from '../../utils/debounce';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  admin: {
    backgroundColor: theme.palette.secondary.main,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

const ITEM_PER_PAGE = 10;

const AdminUsersPage = () => {
  const classes = useStyles();
  const [{ isMobile }] = useAppContext();
  const [search, setSearch] = useState('');
  const {
    changePage, page, items, total,
  } = usePagination(
    'users.admin',
    { search },
    Meteor.users,
    {},
    { sort: { lastName: 1 } },
    ITEM_PER_PAGE,
  );
  // track all global admin users
  const { isLoading, admins } = useTracker(() => {
    const roleshandlers = Meteor.subscribe('roles.admin');
    const adminsIds = Meteor.roleAssignment
      .find({ scope: null, 'role._id': 'admin' })
      .fetch()
      .map((assignment) => assignment.user._id);
    return { isLoading: !roleshandlers.ready(), admins: adminsIds };
  });
  const handleChangePage = (event, value) => {
    changePage(value);
  };
  const searchRef = useRef();
  const debouncedSetSearch = debounce(setSearch, 500);
  const updateSearch = (e) => debouncedSetSearch(e.target.value);
  const resetSearch = () => setSearch('');
  useEffect(() => {
    if (searchRef.current) searchRef.current.value = search;
  }, [search]);
  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);
  const isAdmin = (user) => admins.includes(user._id);
  const changeAdmin = (user) => {
    const method = isAdmin(user) ? 'users.unsetAdmin' : 'users.setAdmin';
    Meteor.call(method, { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else {
        msg.success(
          method === 'users.unsetAdmin'
            ? i18n.__('pages.AdminUsersPage.successUnsetAdmin')
            : i18n.__('pages.AdminUsersPage.successSetAdmin'),
        );
      }
    });
  };
  const deleteUser = (user) => {
    Meteor.call('users.removeUser', { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else msg.success(i18n.__('pages.AdminUsersPage.successDeleteUser'));
    });
  };

  const UserActions = ({ user }) => {
    const [verifyDelete, setVerifyDelete] = useState(false);
    return verifyDelete ? (
      <>
        <Typography
          component="span"
          variant="body2"
          className={classes.inline}
          color={user._id === Meteor.userId() ? 'error' : 'textPrimary'}
        >
          {user._id === Meteor.userId()
            ? i18n.__('pages.AdminUsersPage.deleteSelfConfirmation')
            : i18n.__('pages.AdminUsersPage.deleteUserConfirmation')}
        </Typography>
        <Tooltip title={i18n.__('pages.AdminUsersPage.deleteUser')} aria-label="delete">
          <IconButton edge="end" aria-label="delete" onClick={() => deleteUser(user)}>
            <CheckIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.__('pages.AdminUsersPage.cancelDelete')} aria-label="cancel">
          <IconButton edge="end" aria-label="cancel" onClick={() => setVerifyDelete(false)}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </>
    ) : (
      <>
        <Tooltip
          title={isAdmin(user) ? i18n.__('pages.AdminUsersPage.unsetAdmin') : i18n.__('pages.AdminUsersPage.setAdmin')}
          aria-label="add"
        >
          <IconButton edge="end" aria-label={isAdmin(user) ? 'noadmin' : 'admin'} onClick={() => changeAdmin(user)}>
            {isAdmin(user) ? <ClearIcon /> : <VerifiedUserIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.__('pages.AdminUsersPage.deleteUser')} aria-label="del">
          <IconButton edge="end" aria-label="delete" onClick={() => setVerifyDelete(true)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </>
    );
  };

  UserActions.propTypes = {
    user: PropTypes.objectOf(PropTypes.any).isRequired,
  };

  return (
    <Fade in>
      <Container className={classes.root}>
        {isLoading ? (
          <Spinner />
        ) : (
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.AdminUsersPage.title')}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                margin="normal"
                id="search"
                label={i18n.__('pages.AdminUsersPage.searchText')}
                name="search"
                fullWidth
                onChange={updateSearch}
                type="text"
                variant="outlined"
                inputRef={searchRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton onClick={resetSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            {total > ITEM_PER_PAGE && (
              <Grid item xs={12} sm={12} md={6} lg={6} className={classes.pagination}>
                <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
              </Grid>
            )}
            <Grid item xs={12} sm={12} md={12}>
              <List className={classes.list} disablePadding>
                {items.map((user, i) => [
                  <ListItem alignItems="flex-start" key={`user-${user.emails[0].address}`}>
                    <ListItemAvatar>
                      <Avatar
                        className={isAdmin(user) ? classes.admin : classes.avatar}
                        alt={user.firstName}
                        src={user.firstName}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}${
                        isAdmin(user) ? ` (${i18n.__('pages.AdminUsersPage.admin')})` : ''
                      }`}
                      secondary={(
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {user.emails[0].address}
                          </Typography>
                          {` - ${user.structure}`}
                        </>
                      )}
                    />
                    <ListItemSecondaryAction>
                      <UserActions user={user} />
                    </ListItemSecondaryAction>
                  </ListItem>,
                  i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                    <Divider variant="inset" component="li" key={`divider-${user.emails[0].address}`} />
                  ),
                ])}
              </List>
            </Grid>
            {total > ITEM_PER_PAGE && (
              <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Fade>
  );
};

export default AdminUsersPage;
