import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import ViewListIcon from '@material-ui/icons/ViewList';
import DashboardIcon from '@material-ui/icons/Dashboard';
import FilterListIcon from '@material-ui/icons/FilterList';
import ClearIcon from '@material-ui/icons/Clear';
import ToggleButton from '@material-ui/lab/ToggleButton';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';

import CloseIcon from '@material-ui/icons/Close';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import {
  InputAdornment,
  Typography,
  Chip,
  Fade,
  IconButton,
  Button,
  Collapse,
  Slide,
  AppBar,
  ListItem,
  ListItemText,
  Toolbar,
  Dialog,
  List,
  Divider,
  ListItemSecondaryAction,
} from '@material-ui/core';
import ServiceDetails from '../../components/services/ServiceDetails';
import Services from '../../../api/services/services';
import Categories from '../../../api/categories/categories';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import ServiceDetailsList from '../../components/services/ServiceDetailsList';

const useStyles = (isMobile) =>
  makeStyles((theme) => ({
    flex: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      color: `${theme.palette.tertiary.main} !important`,
      minWidth: 20,
      borderRadius: 10,
      marginLeft: isMobile ? 10 : 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    invertedBadge: {
      height: 20,
      display: 'flex',
      padding: '0 6px',
      flexWrap: 'wrap',
      fontSize: '0.75rem',
      backgroundColor: theme.palette.tertiary.main,
      color: `${theme.palette.primary.main} !important`,
      minWidth: 20,
      borderRadius: 10,
      marginLeft: isMobile ? 10 : 0,
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
    spaceBetween: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    mobileButtonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '0 !important',
    },
    categoryFilterMobile: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: theme.palette.tertiary.main,
      zIndex: theme.zIndex.modal,
    },
    categoriesList: {
      marginTop: 60,
    },
    appBarBottom: {
      bottom: 0,
      top: 'auto',
      backgroundColor: theme.palette.tertiary.main,
    },
    toolbarBottom: {
      justifyContent: 'space-between',
    },
  }));

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function ServicesPage({ services, categories, ready }) {
  const [{ user, loadingUser, isMobile, servicePage }, dispatch] = useAppContext();
  const classes = useStyles(isMobile)();
  const {
    catList = [],
    search = '',
    searchToggle = false,
    filterToggle = false,
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

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'servicePage',
      data: {
        ...servicePage,
        [key]: value,
      },
    });

  const toggleSearch = () => updateGlobalState('searchToggle', !searchToggle);
  const toggleFilter = () => updateGlobalState('filterToggle', !filterToggle);
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

  const toggleButtons = (
    <ToggleButtonGroup value={viewMode} exclusive aria-label={i18n.__('pages.ServicesPage.viewMode')}>
      <ToggleButton
        value="card"
        onClick={changeViewMode}
        title={i18n.__('pages.ServicesPage.viewCard')}
        aria-label={i18n.__('pages.ServicesPage.viewCard')}
      >
        <DashboardIcon color="primary" />
      </ToggleButton>
      <ToggleButton
        value="list"
        onClick={changeViewMode}
        title={i18n.__('pages.ServicesPage.viewList')}
        aria-label={i18n.__('pages.ServicesPage.viewList')}
      >
        <ViewListIcon color="primary" />
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const searchButton = (
    <IconButton onClick={toggleSearch}>
      <SearchIcon fontSize="large" />
    </IconButton>
  );

  const mobileFilterButton = (
    <Button
      style={{ textTransform: 'none' }}
      color="primary"
      variant="outlined"
      size="large"
      onClick={toggleFilter}
      startIcon={<FilterListIcon />}
    >
      {i18n.__('pages.ServicesPage.filter')}{' '}
      {!!catList.length && <span className={classes.badge}>{catList.length}</span>}
    </Button>
  );

  const searchField = (
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
  );

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12} className={isMobile ? null : classes.flex}>
                <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                  {i18n.__('pages.ServicesPage.title')}
                  {searchButton}
                </Typography>
                <div className={classes.spaceBetween}>{!isMobile && toggleButtons}</div>
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              {searchField}
              {isMobile && (
                <Grid item xs={12} sm={12} className={classes.mobileButtonContainer}>
                  {mobileFilterButton}
                  {toggleButtons}
                </Grid>
              )}
              <Grid item xs={12} sm={12} md={12} className={searchToggle ? null : classes.small}>
                <Collapse in={searchToggle && !isMobile} collapsedHeight={0}>
                  <>
                    <Typography variant="h6" display="inline">
                      {i18n.__('pages.ServicesPage.categories')}
                    </Typography>
                    {catList.length > 0 ? (
                      <Button color="primary" onClick={resetCatList} startIcon={<ClearIcon />}>
                        {i18n.__('pages.ServicesPage.reset')}
                      </Button>
                    ) : null}
                    <br />
                    {categories.map((cat) => (
                      <Chip
                        className={classes.chip}
                        key={cat._id}
                        label={cat.name}
                        deleteIcon={
                          <span className={catList.includes(cat._id) ? classes.invertedBadge : classes.badge}>
                            {cat.count}
                          </span>
                        }
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
            <Grid container spacing={isMobile ? 2 : 4}>
              {viewMode === 'list' && isMobile
                ? mapList((service) => (
                    <Grid className={classes.gridItem} item xs={12} md={6} key={service._id}>
                      <ServiceDetailsList service={service} />
                      {/* favAction={favAction(service._id)} // PROPS FOR SERVICEDETAILSLIST */}
                    </Grid>
                  ))
                : mapList((service) => (
                    <Grid className={classes.gridItem} item key={service._id} xs={12} sm={12} md={6} lg={4}>
                      <ServiceDetails
                        service={service}
                        favAction={favAction(service._id)}
                        updateCategories={updateCatList}
                        catList={catList}
                        categories={categories}
                        isShort={!isMobile && viewMode === 'list'}
                      />
                    </Grid>
                  ))}
            </Grid>
            <Dialog fullScreen open={filterToggle && isMobile} TransitionComponent={Transition}>
              <AppBar className={classes.appBar}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" onClick={toggleFilter} aria-label="close">
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6">{i18n.__('pages.ServicesPage.categories')}</Typography>
                  {!!catList.length && <span className={classes.invertedBadge}>{catList.length}</span>}
                </Toolbar>
              </AppBar>
              <List className={classes.categoriesList}>
                {categories.map((cat) => [
                  <ListItem button key={cat._id}>
                    <ListItemText
                      primary={cat.name}
                      onClick={() => updateCatList(cat._id)}
                      secondary={`${cat.count} applications`}
                    />

                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="add" onClick={() => updateCatList(cat._id)}>
                        {catList.includes(cat._id) ? (
                          <CheckCircleRoundedIcon fontSize="large" color="primary" />
                        ) : (
                          <RadioButtonUncheckedRoundedIcon fontSize="large" color="primary" />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>,

                  <Divider key={`${cat._id}divider`} />,
                ])}
              </List>
              <AppBar className={classes.appBarBottom}>
                <Toolbar className={classes.toolbarBottom}>
                  <Button
                    color="primary"
                    disabled={catList.length === 0}
                    variant="outlined"
                    onClick={resetCatList}
                    startIcon={<ClearIcon />}
                  >
                    {i18n.__('pages.ServicesPage.reset')}
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={toggleFilter}
                    startIcon={<CheckCircleRoundedIcon />}
                  >
                    {i18n.__('pages.ServicesPage.validate')}
                  </Button>
                </Toolbar>
              </AppBar>
            </Dialog>
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
  const services = Services.find({ state: { $ne: 10 } }, { sort: { title: 1 } }).fetch();
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
