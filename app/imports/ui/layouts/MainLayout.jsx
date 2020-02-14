import React, { useContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import i18n from 'meteor/universe:i18n';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import TopBar from '../components/TopBar';
import ServicesPage from '../pages/ServicesPage';
import GroupsPage from '../pages/GroupsPage';
import AdminServicesPage from '../pages/AdminServicesPage';
import AdminUserValidationPage from '../pages/AdminUserValidationPage';
import NotFound from '../pages/NotFound';
import { Context } from '../contexts/context';
import AdminRoute from '../components/AdminRoute';
import Spinner from '../components/Spinner';
import SingleServicePage from '../pages/SingleServicePage';
import AdminCategoriesPage from '../pages/AdminCategoriesPage';
import PersonalSpace from '../pages/PersonalSpace';
import AdminSingleServicePage from '../pages/AdminSingleServicePage';
import MsgHandler from '../components/MsgHandler';

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
  const [{ userId, user, loadingUser }] = useContext(Context);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar />
      {loadingUser ? (
        <Spinner full />
      ) : (
        <main className={classes.content}>
          {user.isActive ? (
            <Switch>
              <Route exact path="/" component={PersonalSpace} />
              <Route exact path="/services" component={ServicesPage} />
              <Route exact path="/services/:slug" component={SingleServicePage} />
              <Route exact path="/groups" component={GroupsPage} />

              <AdminRoute
                exact
                path="/adminservices"
                component={AdminServicesPage}
                userId={userId}
                loadingUser={loadingUser}
              />
              <AdminRoute
                exact
                path="/adminservices/new"
                component={AdminSingleServicePage}
                userId={userId}
                loadingUser={loadingUser}
              />
              <AdminRoute
                exact
                path="/adminservices/:_id"
                component={AdminSingleServicePage}
                userId={userId}
                loadingUser={loadingUser}
              />
              <AdminRoute
                path="/usersvalidation"
                component={AdminUserValidationPage}
                userId={userId}
                loadingUser={loadingUser}
              />
              <AdminRoute
                path="/admincategories"
                component={AdminCategoriesPage}
                userId={userId}
                loadingUser={loadingUser}
              />

              <Route component={NotFound} />
            </Switch>
          ) : (
            <Typography variant="h5" color="inherit" paragraph>
              {i18n.__('layouts.MainLayout.inactiveAccount')}
            </Typography>
          )}
          <MsgHandler />
        </main>
      )}
    </div>
  );
}

export default MainLayout;
