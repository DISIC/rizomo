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
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { makeStyles, Divider, Tooltip, TextField, InputAdornment, FormControlLabel, Checkbox } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Pagination from '@material-ui/lab/Pagination';
import { Roles } from 'meteor/alanning:roles';
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
  structureAdmin: {
    backgroundColor: theme.palette.secondary.dark,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

const ITEM_PER_PAGE = 10;

const AdminStructureUsersPage = () => {
  const classes = useStyles();
  const [{ userId, isMobile }] = useAppContext();
  const [search, setSearch] = useState('');
  const [sortByDate, setSortByDate] = useState(false);
  const selfUser = Meteor.users.findOne({ _id: userId });

  const { changePage, page, items, total } = usePagination(
    'users.byStructure',
    { search, sort: sortByDate ? { lastLogin: -1 } : { lastName: 1 } },
    Meteor.users,
    {},
    { sort: sortByDate ? { lastLogin: -1 } : { lastName: 1 } },
    ITEM_PER_PAGE,
  );
  // track all structure admin users
  const { isLoading } = useTracker(() => {
    const roleshandlers = Meteor.subscribe('roles.adminStructure');
    const adminsIds = Meteor.roleAssignment
      .find({ scope: selfUser.structure, 'role._id': 'adminStructure' })
      .fetch()
      .map((assignment) => assignment.user._id);

    return { isLoading: !roleshandlers.ready(), adminsStructure: adminsIds };
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
  const isStructureAdmin = (user) => Roles.userIsInRole(user._id, 'adminStructure', user.structure);
  const changeStructureAdmin = (user) => {
    const method = isStructureAdmin(user) ? 'users.unsetAdminStructure' : 'users.setAdminStructure';
    Meteor.call(method, { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else {
        msg.success(
          method === 'users.unsetAdminStructure'
            ? i18n.__('pages.AdminStructureUsersPage.successUnsetStructureAdmin')
            : i18n.__('pages.AdminStructureUsersPage.successSetStructureAdmin'),
        );
      }
    });
  };
  const loginInfo = (user) =>
    ` - ${
      user.lastLogin
        ? `${i18n.__('pages.AdminStructureUsersPage.loginInfo')} : ${user.lastLogin.toLocaleString()}`
        : i18n.__('pages.AdminStructureUsersPage.neverConnected')
    }`;
  const UserActions = ({ user }) => {
    return (
      <>
        <Tooltip
          title={
            isStructureAdmin(user)
              ? i18n.__('pages.AdminStructureUsersPage.unsetStructureAdmin')
              : i18n.__('pages.AdminStructureUsersPage.setStructureAdmin')
          }
          aria-label="add"
        >
          <IconButton
            edge="end"
            aria-label={isStructureAdmin(user) ? 'noadmin' : 'admin'}
            onClick={() => changeStructureAdmin(user)}
          >
            {isStructureAdmin(user) ? <ClearIcon /> : <GroupAddIcon />}
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
              <Typography variant={isMobile ? 'h6' : 'h4'}>
                {i18n.__('pages.AdminStructureUsersPage.title')} {selfUser.structure}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                margin="normal"
                id="search"
                label={i18n.__('pages.AdminStructureUsersPage.searchText')}
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
                    label={i18n.__('pages.AdminStructureUsersPage.sortByLastLogin')}
                    aria-label={i18n.__('pages.AdminStructureUsersPage.sortByLastLogin')}
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
                        customClass={isStructureAdmin(user) ? classes.structureAdmin : classes.avatar}
                        user={user}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}${
                        isStructureAdmin(user) ? ` (${i18n.__('pages.AdminStructureUsersPage.structureAdmin')})` : ''
                      } ${loginInfo(user)}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {user.emails[0].address}
                          </Typography>
                          {` - ${user.structure ? user.structure : i18n.__('pages.AdminStructureUsersPage.undefined')}`}
                        </>
                      }
                    />
                    {user._id !== userId ? (
                      <ListItemSecondaryAction>
                        <UserActions user={user} />
                      </ListItemSecondaryAction>
                    ) : (
                      ' '
                    )}
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

export default AdminStructureUsersPage;
