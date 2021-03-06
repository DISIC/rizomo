import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@material-ui/core/ListItemText';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import IconButton from '@material-ui/core/IconButton';
import ListAltIcon from '@material-ui/icons/ListAlt';
import Pagination from '@material-ui/lab/Pagination';
import { useHistory } from 'react-router-dom';
import { usePagination } from '../../utils/hooks';
import Spinner from '../../components/system/Spinner';
import TopBar from '../../components/menus/TopBar';
import { useAppContext } from '../../contexts/context';
import Footer from '../../components/menus/Footer';
import UserAvatar from '../../components/users/UserAvatar';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: 60,
    marginBottom: -64,
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  rootMobile: {
    paddingTop: 60,
    marginBottom: -128,
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  admin: {
    backgroundColor: theme.palette.secondary.main,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pubInfos: {
    textAlign: 'end',
    marginRight: 8,
  },
  space: {
    height: 150,
  },
}));

const ITEM_PER_PAGE = 10;

const PublishersPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [{ isMobile, publishersPage }, dispatch] = useAppContext();
  const { search = '' } = publishersPage;
  const [sortByDate, setSortByDate] = useState(false);
  const { changePage, page, items, total, loading } = usePagination(
    'users.publishers',
    { search, sort: sortByDate ? { lastArticle: -1 } : { lastName: 1, firstName: 1 } },
    Meteor.users,
    {},
    { sort: sortByDate ? { lastArticle: -1 } : { lastName: 1, firstName: 1 } },
    ITEM_PER_PAGE,
  );

  const handleChangePage = (value) => {
    changePage(value);
  };

  const handlePublisher = (user) => {
    history.push(`/public/${user._id}`);
  };

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'publishersPage',
      data: {
        ...publishersPage,
        [key]: value,
      },
    });
  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');

  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  return (
    <>
      <TopBar publicMenu />
      <Fade in>
        <Container className={isMobile ? classes.rootMobile : classes.root}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h4">{i18n.__('pages.PublishersPage.title')}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                margin="normal"
                id="search"
                label={i18n.__('pages.PublishersPage.searchText')}
                name="search"
                fullWidth
                value={search}
                onChange={updateSearch}
                type="text"
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
                    label={i18n.__('pages.PublishersPage.sortByDate')}
                    aria-label={i18n.__('pages.PublishersPage.sortByDate')}
                  />
                </Grid>
                {total > ITEM_PER_PAGE && (
                  <Grid item>
                    <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={12} />
          <Grid item xs={12} sm={12} md={12}>
            {loading ? (
              <Spinner />
            ) : (
              <List className={classes.list} disablePadding>
                {items.map((user, i) => [
                  <ListItem
                    button
                    title={i18n.__('pages.PublishersPage.goToPublications')}
                    aria-label={i18n.__('pages.PublishersPage.goToPublications')}
                    onClick={() => handlePublisher(user)}
                    alignItems="flex-start"
                    key={`user-${user._id}`}
                  >
                    <ListItemAvatar>
                      <UserAvatar userAvatar={user.avatar || ''} userFirstName={user.firstName} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {user.structure}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemText
                      className={classes.pubInfos}
                      primary={`${user.articlesCount} ${i18n.__('pages.PublishersPage.articles')}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {`${i18n.__('pages.PublishersPage.updatedAt')} ${user.lastArticle.toLocaleString()}`}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={i18n.__('pages.PublishersPage.goToPublications')} aria-label="goToPublications">
                        <IconButton edge="end" aria-label="goToPublications" onClick={() => handlePublisher(user)}>
                          <ListAltIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>,
                  i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                    <Divider variant="inset" component="li" key={`divider-${user._id}`} />
                  ),
                ])}
              </List>
            )}
          </Grid>
          {total > ITEM_PER_PAGE && (
            <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
              <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
            </Grid>
          )}
          <div className={classes.space} />
        </Container>
      </Fade>
      <Footer />
    </>
  );
};

export default PublishersPage;
