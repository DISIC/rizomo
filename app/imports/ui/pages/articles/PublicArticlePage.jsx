import React, {
  useContext, useRef, useEffect, useState,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Grid from '@material-ui/core/Grid';
import ArrowBack from '@material-ui/icons/ArrowBack';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import {
  InputAdornment, Typography, Fade, IconButton, Collapse, Button,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { Context } from '../../contexts/context';
import ArticleDetails from '../../components/articles/ArticleDetails';
import { usePagination } from '../../utils/hooks';
import TopBar from '../../components/menus/TopBar';

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 60,
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const ITEM_PER_PAGE = 5;

function PublicArticlePage({
  match: {
    params: { userId },
  },
}) {
  const [{ isMobile, articlePage }, dispatch] = useContext(Context);
  const classes = useStyles();
  const { search = '', searchToggle = false } = articlePage;
  const inputRef = useRef(null);
  const [user, setUser] = useState({});
  const {
    changePage, page, items, total, loading,
  } = usePagination(
    'articles.all',
    { search, userId },
    Articles,
    {},
    { sort: { createdAt: -1 } },
    ITEM_PER_PAGE,
  );
  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);

  useEffect(() => {
    Meteor.call('users.findUser', { userId }, (error, result) => {
      setUser(result);
    });
  }, []);

  const handleChangePage = (event, value) => {
    changePage(value);
  };

  const updateGlobalState = (key, value) => dispatch({
    type: 'articlePage',
    data: {
      ...articlePage,
      [key]: value,
    },
  });
  const toggleSearch = () => updateGlobalState('searchToggle', !searchToggle);
  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');

  const filterServices = (article) => {
    let filterSearch = true;
    if (search) {
      let searchText = article.title + article.description;
      searchText = searchText.toLowerCase();
      filterSearch = searchText.indexOf(search.toLowerCase()) > -1;
    }
    return filterSearch;
  };

  const mapList = (func) => items.filter((article) => filterServices(article)).map(func);

  return (
    <>
      <TopBar publicMenu />
      <Fade in>
        <Container className={classes.root}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={12}>
              <Link to="/public">
                <Button color="primary" startIcon={<ArrowBack />}>
                  {i18n.__('pages.PublicArticlePage.goToList')}
                </Button>
              </Link>
            </Grid>
            <Grid item xs={12} className={isMobile ? null : classes.flex}>
              <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                {!!user.firstName && `${i18n.__('pages.PublicArticlePage.title')} ${user.firstName} ${user.lastName}`}
                <IconButton onClick={toggleSearch}>
                  <SearchIcon fontSize="large" />
                </IconButton>
              </Typography>
              <div className={classes.spaceBetween} />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={6} className={searchToggle ? null : classes.small}>
              <Collapse in={searchToggle} collapsedHeight={0}>
                <TextField
                  margin="normal"
                  id="search"
                  label={i18n.__('pages.PublicArticlePage.searchText')}
                  name="search"
                  fullWidth
                  onChange={updateSearch}
                  type="text"
                  value={search}
                  variant="outlined"
                  inputProps={{
                    ref: inputRef,
                  }}
                  // eslint-disable-next-line react/jsx-no-duplicate-props
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
              </Collapse>
            </Grid>
          </Grid>
          {loading ? (
            <Spinner />
          ) : (
            <Grid container spacing={isMobile ? 2 : 4}>
              {total > ITEM_PER_PAGE && (
                <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                  <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                </Grid>
              )}
              {mapList((article) => (
                <Grid className={classes.gridItem} item key={article._id} md={12}>
                  <ArticleDetails publicPage article={article} />
                </Grid>
              ))}
              {total > ITEM_PER_PAGE && (
                <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                  <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                </Grid>
              )}
            </Grid>
          )}
        </Container>
      </Fade>
    </>
  );
}

PublicArticlePage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};
export default PublicArticlePage;
