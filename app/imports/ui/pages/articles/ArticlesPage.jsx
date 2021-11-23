import { Meteor } from 'meteor/meteor';
import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ShareIcon from '@material-ui/icons/Share';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowBack from '@material-ui/icons/ArrowBack';

import { Link, useLocation } from 'react-router-dom';
import Pagination from '@material-ui/lab/Pagination';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import ArticleDetails from '../../components/articles/ArticleDetails';
import { usePagination } from '../../utils/hooks';
import TopBar from '../../components/menus/TopBar';
import CollapsingSearch from '../../components/system/CollapsingSearch';
import Footer from '../../components/menus/Footer';

const useStyles = makeStyles((theme) => ({
  root: {
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
  buttonOption: {
    textTransform: 'none',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.tertiary.main,
    fontWeight: 'bold',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.tertiary.main,
    },
    margin: 5,
  },
}));

const ITEM_PER_PAGE = 5;

function ArticlesPage() {
  const [{ isMobile, articlePage }, dispatch] = useAppContext();
  const classes = useStyles();
  const { pathname } = useLocation();
  const publicPage = pathname.indexOf('/publications') !== 0;
  const i18nCode = publicPage ? 'PublicArticlePage' : 'ArticlesPage';
  const { search = '', searchToggle = false } = articlePage;
  const inputRef = useRef(null);
  const { changePage, page, items, total, loading } = usePagination(
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
  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  const updateGlobalState = (key, value) =>
    dispatch({
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
  const blogPage = Meteor.settings.public.laboiteBlogURL || `${Meteor.absoluteUrl()}public/`;

  const handleCopyURL = () => {
    let myPublicPublicationURL;
    if (Meteor.settings.public.laboiteBlogURL !== '') {
      myPublicPublicationURL = `${blogPage}/authors/${Meteor.userId()}`;
    } else {
      myPublicPublicationURL = `${blogPage}${Meteor.userId()}`;
    }
    navigator.clipboard
      .writeText(myPublicPublicationURL)
      .then(msg.success(i18n.__(`pages.${i18nCode}.successCopyURL`)));
  };

  return (
    <>
      {publicPage && <TopBar publicMenu />}
      <Fade in>
        <Container className={isMobile ? classes.rootMobile : classes.root}>
          <Grid container spacing={4}>
            {publicPage && (
              <Grid item xs={12} sm={12} md={12}>
                <Link to="/public">
                  <Button color="primary" startIcon={<ArrowBack />}>
                    {i18n.__('pages.PublicArticlePage.goToList')}
                  </Button>
                </Link>
              </Grid>
            )}
            <Grid item xs={12} className={isMobile ? null : classes.flex}>
              <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                {i18n.__(`pages.${i18nCode}.title`)}

                {!publicPage && (
                  <Tooltip
                    title={i18n.__(`pages.${i18nCode}.copyOwnPublicPageUrl`)}
                    aria-label={i18n.__(`pages.${i18nCode}.copyOwnPublicPageUrl`)}
                  >
                    <IconButton onClick={handleCopyURL}>
                      <ShareIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip
                  title={i18n.__(`pages.${i18nCode}.searchArticle`)}
                  aria-label={i18n.__(`pages.${i18nCode}.searchArticle`)}
                >
                  <IconButton onClick={toggleSearch}>
                    <SearchIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              </Typography>
              {!publicPage && (
                <div className={classes.spaceBetween}>
                  <Link to="/publications/new" tabIndex={-1}>
                    <Button startIcon={<AddIcon />} className={classes.buttonOption} size="medium" variant="contained">
                      {i18n.__(`pages.${i18nCode}.addNewArticle`)}
                    </Button>
                  </Link>

                  <Button
                    startIcon={<OpenInNewIcon />}
                    className={classes.buttonOption}
                    size="medium"
                    variant="contained"
                    onClick={() => window.open(blogPage, '_blank')}
                  >
                    {i18n.__(`pages.${i18nCode}.openPublicPage`)}
                  </Button>
                </div>
              )}
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={6} className={searchToggle ? null : classes.small}>
              <CollapsingSearch
                classes={searchToggle ? '' : classes.small}
                label={i18n.__(`pages.${i18nCode}.searchText`)}
                updateSearch={updateSearch}
                resetSearch={resetSearch}
                searchToggle={searchToggle}
                search={search}
                inputRef={inputRef}
              />
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
                  <ArticleDetails publicPage={publicPage} article={article} />
                </Grid>
              ))}
              {total > ITEM_PER_PAGE && (
                <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                  <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                </Grid>
              )}
            </Grid>
          )}
          {publicPage && <div className={classes.space} />}
        </Container>
      </Fade>
      {publicPage && <Footer />}
    </>
  );
}

export default ArticlesPage;
