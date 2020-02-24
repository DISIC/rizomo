import React, { useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import ViewListIcon from '@material-ui/icons/ViewList';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ClearIcon from '@material-ui/icons/Clear';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import {
  InputAdornment, Typography, Chip, Fade, IconButton, Button, Collapse,
} from '@material-ui/core';
import ServiceDetails from '../components/ServiceDetails';
import Services from '../../api/services/services';
import Categories from '../../api/categories/categories';
import Spinner from '../components/Spinner';
import { Context } from '../contexts/context';
import ServiceDetailsList from '../components/ServiceDetailsList';

const useStyles = makeStyles((theme) => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGrid: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(5),
  },
  chip: {
    margin: theme.spacing(1),
  },
  smallGrid: {
    height: 20,
  },
  badge: {
    height: 20,
    display: 'flex',
    padding: '0 6px',
    flexWrap: 'wrap',
    fontSize: '0.75rem',
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.secondary.main} !important`,
    minWidth: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  small: {
    padding: '5px !important',
    transition: 'all 300ms ease-in-out',
  },
}));

function ServicesPage({ services, categories, ready }) {
  const classes = useStyles();
  const [{
    user, loadingUser, isMobile, servicePage,
  }, dispatch] = useContext(Context);
  const {
    catList = [],
    search = '',
    searchToggle = false,
    viewMode = 'card', // Possible values : "card" or "list"
  } = servicePage;
  const inputRef = useRef(null);

  const favs = loadingUser ? [] : user.favServices;

  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);

  const updateGlobalState = (key, value) => dispatch({
    type: 'servicePage',
    data: {
      ...servicePage,
      [key]: value,
    },
  });

  const toggleSearch = () => updateGlobalState('searchToggle', !searchToggle);
  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');
  const resetCatList = () => updateGlobalState('catList', []);
  const changeViewMode = (_, value) => updateGlobalState('viewMode', value);
  const updateCatList = (catId) => {
    // Call by click on categories of services
    if (catList.includes(catId)) {
      // catId already in list so remove it
      updateGlobalState(
        'catList',
        catList.filter((id) => id !== catId),
      );
    } else {
      // add new catId to list
      updateGlobalState('catList', [...catList, catId]);
    }
  };

  const filterServices = (service) => {
    let filterSearch = true;
    let filterCat = true;
    if (search) {
      let searchText = service.title + service.description;
      searchText = searchText.toLowerCase();
      filterSearch = searchText.indexOf(search.toLowerCase()) > -1;
    }
    if (catList.length > 0) {
      const intersection = catList.filter((value) => service.categories.includes(value));
      filterCat = intersection.length > 0;
    }
    return filterSearch && filterCat;
  };

  const mapList = (func) => services.filter((service) => filterServices(service)).map(func);
  const favAction = (id) => (favs.indexOf(id) === -1 ? 'fav' : 'unfav');

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.cardGrid}>
            <Grid container spacing={4}>
              <Grid item xs={12} className={classes.flex}>
                <Typography variant="h4" className={classes.flex}>
                  {i18n.__('pages.ServicesPage.title')}
                  <IconButton onClick={toggleSearch}>
                    <SearchIcon fontSize="large" />
                  </IconButton>
                </Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={changeViewMode}
                  aria-label={i18n.__('pages.ServicesPage.viewMode')}
                >
                  <ToggleButton
                    value="card"
                    title={i18n.__('pages.ServicesPage.viewCard')}
                    aria-label={i18n.__('pages.ServicesPage.viewCard')}
                  >
                    <DashboardIcon color="primary" />
                  </ToggleButton>
                  <ToggleButton
                    value="list"
                    title={i18n.__('pages.ServicesPage.viewList')}
                    aria-label={i18n.__('pages.ServicesPage.viewList')}
                  >
                    <ViewListIcon color="primary" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={12} md={6} className={searchToggle ? null : classes.small}>
                <Collapse in={searchToggle} collapsedHeight={0}>
                  <TextField
                    margin="normal"
                    id="search"
                    label={i18n.__('pages.ServicesPage.searchText')}
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
              <Grid item xs={12} sm={12} md={12} className={searchToggle ? null : classes.small}>
                <Collapse in={searchToggle} collapsedHeight={0}>
                  <>
                    <Typography variant="h6" display="inline">
                      {i18n.__('pages.ServicesPage.categories')}
                    </Typography>
                    <Button color="primary" onClick={resetCatList} startIcon={<ClearIcon />}>
                      {i18n.__('pages.ServicesPage.reset')}
                    </Button>
                    <br />
                    {categories.map((cat) => (
                      <Chip
                        className={classes.chip}
                        key={cat._id}
                        label={cat.name}
                        deleteIcon={<span className={classes.badge}>{cat.count}</span>}
                        onDelete={() => updateCatList(cat._id)}
                        variant={catList.includes(cat._id) ? 'default' : 'outlined'}
                        color={catList.includes(cat._id) ? 'primary' : 'default'}
                        onClick={() => updateCatList(cat._id)}
                      />
                    ))}
                  </>
                </Collapse>
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              {viewMode === 'list' && !isMobile
                ? mapList((service) => (
                  <Grid className={classes.gridItem} item xs={12} md={6} key={service._id}>
                    <ServiceDetailsList service={service} favAction={favAction(service._id)} />
                  </Grid>
                ))
                : mapList((service) => (
                  <Grid className={classes.gridItem} item key={service._id} xs={12} sm={6} md={4}>
                    <ServiceDetails
                      service={service}
                      favAction={favAction(service._id)}
                      updateCategories={updateCatList}
                      catList={catList}
                      categories={categories}
                      isShort={!!(isMobile && viewMode === 'list')}
                    />
                  </Grid>
                ))}
            </Grid>
          </Container>
        </Fade>
      )}
    </>
  );
}

ServicesPage.propTypes = {
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const servicesHandle = Meteor.subscribe('services.all');
  const services = Services.find({}, { sort: { title: 1 } }).fetch();
  const categoriesHandle = Meteor.subscribe('categories.all');
  const cats = Categories.find({}, { sort: { name: 1 } }).fetch();
  const categories = cats.map((cat) => ({ ...cat, count: Services.find({ categories: { $in: [cat._id] } }).count() }));
  const ready = servicesHandle.ready() && categoriesHandle.ready();
  return {
    services,
    categories,
    ready,
  };
})(ServicesPage);
