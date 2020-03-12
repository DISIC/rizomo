import React, { useContext, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';

import { Typography, Fade } from '@material-ui/core';
import ServiceDetails from '../components/services/ServiceDetails';
import Spinner from '../components/system/Spinner';
import { Context } from '../contexts/context';
import Services from '../../api/services/services';
import Categories from '../../api/categories/categories';

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  chip: {
    margin: theme.spacing(1),
  },
  badge: { position: 'inherit' },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

function ServicesPage({ services, ready, categories }) {
  const classes = useStyles();
  const [{ user, loadingUser }] = useContext(Context);
  const favs = loadingUser ? [] : user.favServices;
  const [catList, setCatList] = useState([]);

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

  const filterServices = (service) => favs.find((serviceId) => serviceId === service._id);

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.cardGrid}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={12} md={12}>
                <Typography variant="h4">{i18n.__('pages.PersonalSpace.welcome')}</Typography>
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
                        categories={categories}
                        updateCategories={updateCatList}
                        catList={catList}
                      />
                    </Grid>
                  );
                })}
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
  const categoriesHandle = Meteor.subscribe('categories.all');
  const services = Services.find({}, { sort: { title: 1 } }).fetch();
  const ready = servicesHandle.ready() && categoriesHandle.ready();
  const categories = Categories.find({}, { sort: { name: 1 } }).fetch();
  return {
    services,
    categories,
    ready,
  };
})(ServicesPage);
