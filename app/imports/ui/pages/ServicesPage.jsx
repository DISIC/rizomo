import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import { CircularProgress } from '@material-ui/core';

import ServiceDetails from '../components/ServiceDetails';
import Services from '../../api/services/services';
import UserContext from '../contexts/UserContext';

const useStyles = makeStyles((theme) => ({
  AppChoice: {
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 0,
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 8),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  loading: {
    width: '100%',
    textAlign: 'center',
    marginTop: 50,
  },
}));

function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `action-tab-${index}`,
    'aria-controls': `action-tabpanel-${index}`,
  };
}

function ServicesPage({ services, loading, searchString }) {
  const classes = useStyles();
  const theme = useTheme();

  const [value, setValue] = React.useState(0);

  const handleChangeValue = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const filterFavorites = (service, favs) => {
    if (favs.indexOf(service._id) === -1) return false;
    // service is in favorites: apply search filter
    return filterServices(service);
  };

  const filterNoFavorites = (service, favs) => {
    if (favs.indexOf(service._id) !== -1) return false;
    // service is not in favorites: apply search filter
    return filterServices(service);
  };

  const filterServices = (service) => {
    let searchText = service.title + service.description;
    searchText = searchText.toLowerCase();
    if (!searchString) return true;
    return searchText.indexOf(searchString.toLowerCase()) > -1;
  };

  return (
    <>
      <AppBar className={classes.AppChoice} position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChangeValue}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="action tabs example"
        >
          <Tab label="Mes services" {...a11yProps(0)} />
          <Tab label="Tous mes services" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      {loading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            {/* display favorite services */}
            <Container className={classes.cardGrid} maxWidth="md">
              <Grid container spacing={4}>
                <UserContext.Consumer>
                  {({ user, loading }) => {
                    const favs = loading ? [] : user.favServices;
                    return services
                      .filter((service) => filterFavorites(service, favs))
                      .map((service) => (
                        <Grid item key={service._id} xs={12} sm={6} md={4}>
                          <ServiceDetails service={service} favAction="unfav" />
                        </Grid>
                      ));
                  }}
                </UserContext.Consumer>
              </Grid>
            </Container>
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            {/* display all services */}
            <Container className={classes.cardGrid} maxWidth="md">
              <Grid container spacing={4}>
                <UserContext.Consumer>
                  {({ user, loading }) => {
                    const favs = loading ? [] : user.favServices;
                    return services
                      .filter((service) => filterNoFavorites(service, favs))
                      .map((service) => (
                        <Grid item key={service._id} xs={12} sm={6} md={4}>
                          <ServiceDetails service={service} favAction="fav" />
                        </Grid>
                      ));
                  }}
                </UserContext.Consumer>
              </Grid>
            </Container>
          </TabPanel>
        </SwipeableViews>
      )}
    </>
  );
}

ServicesPage.propTypes = {
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  searchString: PropTypes.string.isRequired,
};

export default withTracker(() => {
  const servicesHandle = Meteor.subscribe('services.all');
  const loading = !servicesHandle.ready();
  const services = Services.find({}, { sort: { title: 1 } }).fetch();
  return {
    services,
    loading,
  };
})(ServicesPage);
