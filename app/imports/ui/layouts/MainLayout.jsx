import React from 'react';
import { Route, Switch } from 'react-router-dom';
import clsx from 'clsx';
import i18n from 'meteor/universe:i18n';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import PropTypes from 'prop-types';

import TopBar from '../components/TopBar';
import LeftDrawer from '../components/LeftDrawer';
import ServicesPage from '../pages/ServicesPage';
import GroupsPage from '../pages/GroupsPage';
import AdminServicesPage from '../pages/AdminServicesPage';
import NotFound from '../pages/NotFound';
import withUser from '../contexts/withUser';

// CSS
const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    position: 'relative',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    marginTop: 50,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

<<<<<<< HEAD
function MainLayout({ currentUser }) {
||||||| merged common ancestors
export default function MainLayout() {
=======
export default function MainLayout({ location }) {
>>>>>>> WIP Desactivate top bar search input for admin services page
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchString, setSearchString] = React.useState('');
  const showSearchInput = location.pathname !== '/adminservices'; // No top bar search input for admin services page

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar
        setDrawerOpen={setDrawerOpen}
        drawerOpen={drawerOpen}
        showSearchInput={showSearchInput}
        searchString={searchString}
        setSearchString={setSearchString}
      />
      <LeftDrawer setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: drawerOpen,
        })}
      >
        {currentUser.isActive ? (
          <Switch>
            <Route path="/services" render={(props) => <ServicesPage {...props} searchString={searchString} />} />
            <Route path="/groups" render={(props) => <GroupsPage {...props} searchString={searchString} />} />
            <Route
              path="/adminservices"
              render={(props) => <AdminServicesPage {...props} searchString={searchString} />}
            />
            <Route path="/" render={(props) => <ServicesPage {...props} searchString={searchString} />} />
            <Route component={NotFound} />
          </Switch>
        ) : (
          <Typography variant="h5" color="inherit" paragraph>
            {i18n.__('layouts.MainLayout.inactiveAccount')}
          </Typography>
        )}
      </main>
    </div>
  );
}

export default withUser(MainLayout); // withUser adds currentUser in props

MainLayout.defaultProps = {
  location: { pathname: '' },
};

MainLayout.propTypes = {
  currentUser: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.objectOf(PropTypes.any),
};
