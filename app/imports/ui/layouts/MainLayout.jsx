import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Route, Switch } from 'react-router-dom';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import TopBar from '../components/TopBar';
import LeftDrawer from '../components/LeftDrawer';
import ServicesPage from '../pages/ServicesPage';
import UserContext from '../contexts/UserContext';

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

function MainLayout({ user, loading }) {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchString, setSearchString] = React.useState('');

  return (
    <div className={classes.root}>
      <UserContext.Provider value={{ user, loading }}>
        <CssBaseline />
        <TopBar setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} setSearchString={setSearchString} />
        <LeftDrawer setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: drawerOpen,
          })}
        >
          <Switch>
            <Route path="/" render={(props) => <ServicesPage {...props} searchString={searchString} />} />
          </Switch>
        </main>
      </UserContext.Provider>
    </div>
  );
}

MainLayout.propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  loading: PropTypes.bool,
};

MainLayout.defaultProps = {
  user: { username: '' },
  loading: true,
};

export default withTracker(() => {
  const userHandle = Meteor.subscribe('userData');
  const loading = !userHandle.ready();
  const user = Meteor.user();
  return {
    user,
    loading,
  };
})(MainLayout);
