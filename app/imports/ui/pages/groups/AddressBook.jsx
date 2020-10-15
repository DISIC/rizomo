import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowBack from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { makeStyles, Divider, Tooltip, Button, TextField, InputAdornment } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import Pagination from '@material-ui/lab/Pagination';
import { useHistory } from 'react-router-dom';
import { usePagination } from '../../utils/hooks';
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
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

const ITEM_PER_PAGE = 10;

const AddressBook = ({
  match: {
    params: { slug },
  },
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [search, setSearch] = useState('');
  const { changePage, page, items, total } = usePagination(
    'users.group',
    { search, slug },
    Meteor.users,
    {},
    { sort: { lastName: 1 } },
    ITEM_PER_PAGE,
  );

  const handleChangePage = (event, value) => {
    changePage(value);
  };
  const updateSearch = (e) => setSearch(e.target.value);
  const resetSearch = () => setSearch('');

  const goBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
              {i18n.__('pages.AddressBook.back')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              margin="normal"
              id="search"
              label={i18n.__('pages.AddressBook.searchText')}
              name="search"
              fullWidth
              onChange={updateSearch}
              type="text"
              value={search}
              variant="outlined"
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
                    <UserAvatar user={user} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                          {user.emails[0].address}
                        </Typography>
                        {` - ${user.structure}`}
                      </>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Tooltip title={`${i18n.__('pages.AddressBook.sendEmail')} ${user.firstName}`} aria-label="add">
                      <IconButton edge="end" aria-label="comments" href={`mailto:${user.emails[0].address}`}>
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
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
      </Container>
    </Fade>
  );
};

export default AddressBook;

AddressBook.defaultProps = {
  match: {},
};

AddressBook.propTypes = {
  match: PropTypes.objectOf(PropTypes.any),
};
