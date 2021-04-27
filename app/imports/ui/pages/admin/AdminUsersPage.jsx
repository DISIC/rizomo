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
import PersonAddDisabled from '@material-ui/icons/PersonAddDisabled';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import IconButton from '@material-ui/core/IconButton';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import DeleteIcon from '@material-ui/icons/Delete';
import Pagination from '@material-ui/lab/Pagination';
import { Roles } from 'meteor/alanning:roles';
import { structures } from '../../../api/users/structures';
import { usePagination } from '../../utils/hooks';
import Spinner from '../../components/system/Spinner';
import debounce from '../../utils/debounce';
import { useAppContext } from '../../contexts/context';
import UserAvatar from '../../components/users/UserAvatar';

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
  adminstructure: {
    backgroundColor: theme.palette.secondary.dark,
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
  const [sortByDate, setSortByDate] = useState(false);

  const { changePage, page, items, total } = usePagination(
    'users.admin',
    { search, sort: sortByDate ? { lastLogin: -1 } : { lastName: 1 } },
    Meteor.users,
    {},
    { sort: sortByDate ? { lastLogin: -1 } : { lastName: 1 } },
    ITEM_PER_PAGE,
  );
  // track all global admin users
  const { isLoading, admins } = useTracker(() => {
    const roleshandlers = Meteor.subscribe('roles.admin');
    const adminsIds = Meteor.roleAssignment
      .find({ scope: null, 'role._id': 'admin' })
      .fetch()
      .map((assignment) => assignment.user._id);

    const roleshandlers2 = Meteor.subscribe('roles.adminStructureAll');
    const adminsIds2 = Meteor.roleAssignment
      .find({ scope: { $in: structures }, 'role._id': 'adminStructure' })
      .fetch()
      .map((assignment) => assignment.user._id);

    return {
      isLoading: !roleshandlers.ready() && !roleshandlers2.ready(),
      admins: adminsIds,
      adminStructure: adminsIds2,
    };
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
  const isStructureAdmin = (user) => Roles.userIsInRole(user._id, 'adminStructure', user.structure);

  const changeAdminStructure = (user) => {
    const method = isStructureAdmin(user) ? 'users.unsetAdminStructure' : 'users.setAdminStructure';
    Meteor.call(method, { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else {
        msg.success(
          method === 'users.unsetAdminStructure'
            ? i18n.__('pages.AdminUsersPage.successUnsetAdminStructure')
            : i18n.__('pages.AdminUsersPage.successSetAdminStructure'),
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
  const loginInfo = (user) =>
    ` - ${
      user.lastLogin
        ? `${i18n.__('pages.AdminUsersPage.loginInfo')} : ${user.lastLogin.toLocaleString()}`
        : i18n.__('pages.AdminUsersPage.neverConnected')
    }`;
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
          title={
            isStructureAdmin(user)
              ? i18n.__('pages.AdminUsersPage.unsetAdminStructure')
              : i18n.__('pages.AdminUsersPage.setAdminStructure')
          }
          aria-label="add"
        >
          <IconButton
            edge="end"
            aria-label={isStructureAdmin(user) ? 'noadminstructure' : 'adminstructure'}
            onClick={() => changeAdminStructure(user)}
          >
            {isStructureAdmin(user) ? <PersonAddDisabled /> : <GroupAddIcon />}
          </IconButton>
        </Tooltip>
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
            <Grid item xs={12} sm={12} md={6} lg={6} className={classes.pagination}>
              <Grid>
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sortByDate}
                        onChange={() => setSortByDate(!sortByDate)}
                        name="checkSortByDate"
                        color="primary"
                      />
                    }
                    label={i18n.__('pages.AdminUsersPage.sortByLastLogin')}
                    aria-label={i18n.__('pages.AdminUsersPage.sortByLastLogin')}
                  />
                </Grid>
                {total > ITEM_PER_PAGE && (
                  <Grid item>
                    <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <List className={classes.list} disablePadding>
                {items.map((user, i) => [
                  <ListItem alignItems="flex-start" key={`user-${user.emails[0].address}`}>
                    <ListItemAvatar>
                      <UserAvatar
                        customClass={
                          isAdmin(user)
                            ? classes.admin
                            : isStructureAdmin(user)
                            ? classes.adminstructure
                            : classes.avatar
                        }
                        userAvatar={user.avatar}
                        userFirstName={user.firstName}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}${
                        isAdmin(user)
                          ? ` (${i18n.__('pages.AdminUsersPage.admin')})`
                          : isStructureAdmin(user)
                          ? ` (${i18n.__('pages.AdminUsersPage.adminStructure')})`
                          : ''
                      } ${loginInfo(user)}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {user.emails[0].address}
                          </Typography>
                          {` - ${user.structure ? user.structure : i18n.__('pages.AdminUsersPage.undefined')}`}
                        </>
                      }
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
