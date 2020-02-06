import React, { useContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import i18n from 'meteor/universe:i18n';
import Typography from '@material-ui/core/Typography';
import { Roles } from 'meteor/alanning:roles';

import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import TopBar from '../components/TopBar';
import ServicesPage from '../pages/ServicesPage';
import GroupsPage from '../pages/GroupsPage';
import AdminServicesPage from '../pages/AdminServicesPage';
import AdminUserValidationPage from '../pages/AdminUserValidationPage';
import NotFound from '../pages/NotFound';
import { Context } from '../contexts/context';

// CSS
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
    marginTop: 130,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

function MainLayout() {
  const classes = useStyles();
  const [{ userId, user }] = useContext(Context);
  const isAdmin = Roles.userIsInRole(userId, 'admin');

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar />
      <main className={classes.content}>
        {user.isActive ? (
          <Switch>
            <Route path="/services" component={ServicesPage} />
            <Route path="/groups" component={GroupsPage} />
            {isAdmin ? <Route path="/adminservices" component={AdminServicesPage} /> : null}
            {isAdmin ? <Route path="/usersvalidation" component={AdminUserValidationPage} /> : null}
            <Route exact path="/" component={ServicesPage} />
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

export default MainLayout;
