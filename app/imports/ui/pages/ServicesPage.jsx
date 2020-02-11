import React, { useContext, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';

import {
  InputAdornment, Typography, Paper, Chip,
} from '@material-ui/core';
import ServiceDetails from '../components/ServiceDetails';
import Services from '../../api/services/services';
import Categories from '../../api/categories/categories';
import Spinner from '../components/Spinner';
import { Context } from '../contexts/context';

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

function ServicesPage({ services, categories, ready }) {
  const classes = useStyles();
  const [{ user, loadingUser }] = useContext(Context);
  const favs = loadingUser ? [] : user.favServices;
  const [search, setSearch] = useState('');
  const [catList, setCatList] = useState([]);

  const updateSearch = (e) => setSearch(e.target.value);

  const updateCatList = (catId) => {
    // Call by click on categories of services
    if (catList.includes(catId)) {
      // catId already in list so remove it
      setCatList(catList.filter((id) => id !== catId));
    } else {
      // add new catId to list
      setCatList([...catList, catId]);
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

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <Container className={classes.cardGrid}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant="h4">{i18n.__('pages.ServicesPage.title')}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant="h6" display="inline">
                {i18n.__('pages.ServicesPage.categories')}
                {' :'}
              </Typography>
              {categories.map((cat) => (
                <Chip
                  className={classes.chip}
                  key={cat._id}
                  label={cat.name}
                  variant={catList.includes(cat._id) ? 'outlined' : 'default'}
                  color={catList.includes(cat._id) ? 'primary' : 'default'}
                  onClick={() => updateCatList(cat._id)}
                />
              ))}
            </Grid>
            {services
              .filter((service) => filterServices(service))
              .map((service) => {
                const favAction = favs.indexOf(service._id) === -1 ? 'fav' : 'unfav';
                return (
                  <Grid className={classes.gridItem} item key={service._id} xs={12} sm={6} md={4} lg={3}>
                    <ServiceDetails
                      service={service}
                      favAction={favAction}
                      updateCategories={updateCatList}
                      catList={catList}
                    />
                  </Grid>
                );
              })}
          </Grid>
        </Container>
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
  const categories = Categories.find({}, { sort: { name: 1 } }).fetch();
  const ready = servicesHandle.ready() && categoriesHandle.ready();
  return {
    services,
    categories,
    ready,
  };
})(ServicesPage);
