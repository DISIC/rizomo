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

import { InputAdornment, Typography } from '@material-ui/core';
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
}));

function ServicesPage({
  services, loading, categories, loadingCat,
}) {
  const classes = useStyles();
  const [{ user, loadingUser }] = useContext(Context);
  const favs = loadingUser ? [] : user.favServices;
  const [search, setSearch] = useState('');

  const updateSearch = (e) => setSearch(e.target.value);

  const filterServices = (service) => {
    let searchText = service.title + service.description;
    searchText = searchText.toLowerCase();
    if (!search) return true;
    return searchText.indexOf(search.toLowerCase()) > -1;
  };

  console.log('loadingCat', loadingCat);
  console.log('categories', categories);

  return (
    <>
      {loading ? (
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
            {services
              .filter((service) => filterServices(service))
              .map((service) => {
                const favAction = favs.indexOf(service._id) === -1 ? 'fav' : 'unfav';
                return (
                  <Grid item key={service._id} xs={12} sm={4} md={3}>
                    <ServiceDetails service={service} favAction={favAction} />
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
  loading: PropTypes.bool.isRequired,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingCat: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const servicesHandle = Meteor.subscribe('services.all');
  const loading = !servicesHandle.ready();
  const services = Services.find({}, { sort: { title: 1 } }).fetch();
  const categoriesHandle = Meteor.subscribe('categories.all');
  const loadingCat = !categoriesHandle.ready();
  const categories = Categories.find({}, { sort: { name: 1 } }).fetch();
  return {
    services,
    loading,
    categories,
    loadingCat,
  };
})(ServicesPage);
