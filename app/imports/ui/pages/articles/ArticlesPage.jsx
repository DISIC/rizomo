import React, { useContext, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import {
  InputAdornment, Typography, Fade, IconButton, Collapse, Tooltip,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import Pagination from '@material-ui/lab/Pagination';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { Context } from '../../contexts/context';
import ArticleDetails from '../../components/articles/ArticleDetails';
import { usePagination } from '../../utils/hooks';

const useStyles = makeStyles(() => ({
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

function ArticlesPage() {
  const [{ isMobile, articlePage }, dispatch] = useContext(Context);
  const classes = useStyles();
  const { search = '', searchToggle = false } = articlePage;
  const inputRef = useRef(null);
  const {
    changePage, page, items, total, loading,
  } = usePagination(
    'articles.all',
    { search },
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
    <Fade in>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} className={isMobile ? null : classes.flex}>
            <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
              {i18n.__('pages.ArticlesPage.title')}

              <IconButton onClick={toggleSearch}>
                <SearchIcon fontSize="large" />
              </IconButton>
              <Link to="/publications/new">
                <IconButton>
                  <AddIcon fontSize="large" />
                </IconButton>
              </Link>

              <Tooltip
                title={i18n.__('pages.ArticlesPage.openPublicPage')}
                aria-label={i18n.__('pages.ArticlesPage.openPublicPage')}
              >
                <IconButton onClick={() => window.open(`${Meteor.absoluteUrl()}public/${Meteor.userId()}`, '_blank')}>
                  <OpenInNewIcon fontSize="large" />
                </IconButton>
              </Tooltip>
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
                label={i18n.__('pages.ArticlesPage.searchText')}
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
                <ArticleDetails article={article} />
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
  );
}

export default ArticlesPage;
