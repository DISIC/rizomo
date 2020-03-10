import React, { useContext, lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import TopBar from '../components/TopBar';
import ServicesPage from '../pages/ServicesPage';
import GroupsPage from '../pages/GroupsPage';
import NotFound from '../pages/NotFound';
import { Context } from '../contexts/context';
import Spinner from '../components/Spinner';
import SingleServicePage from '../pages/SingleServicePage';
import PersonalSpace from '../pages/PersonalSpace';
import AdminRoute from '../components/AdminRoute';
import MobileMenu from '../components/MobileMenu';
import NotValidatedMessage from '../components/NotValidatedMessage';

// dynamic imports
const AdminSingleServicePage = lazy(() => import('../pages/AdminSingleServicePage'));
const AdminCategoriesPage = lazy(() => import('../pages/AdminCategoriesPage'));
const AdminServicesPage = lazy(() => import('../pages/AdminServicesPage'));
const AdminUserValidationPage = lazy(() => import('../pages/AdminUserValidationPage'));
const AdminGroupsPage = lazy(() => import('../pages/AdminGroupsPage'));
const AdminSingleGroupPage = lazy(() => import('../pages/AdminSingleGroupPage'));

// CSS
const useStyles = (isMobile) => makeStyles((theme) => ({
  root: {
    display: 'flex',
    position: 'relative',
  },
  content: {
    flexGrow: 1,
    padding: isMobile ? null : theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginTop: 50,
    marginBottom: 50,
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
  const [{
    userId, user, loadingUser, isMobile,
  }] = useContext(Context);
  const classes = useStyles(isMobile)();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar />
      {loadingUser ? (
        <Spinner full />
      ) : (
        <main className={classes.content}>
          <Suspense fallback={<Spinner full />}>
            {user.isActive ? (
              <Switch>
                <Route exact path="/" component={PersonalSpace} />
                <Route exact path="/services" component={ServicesPage} />
                <Route exact path="/services/:slug" component={SingleServicePage} />
                <Route exact path="/groups" component={GroupsPage} />
                <AdminRoute
                  exact
                  path="/admingroups"
                  component={AdminGroupsPage}
                  userId={userId}
                  loadingUser={loadingUser}
                />
                <AdminRoute
                  exact
                  path="/admingroups/new"
                  component={AdminSingleGroupPage}
                  userId={userId}
                  loadingUser={loadingUser}
                />
                <AdminRoute
                  exact
                  path="/admingroups/:_id"
                  component={AdminSingleGroupPage}
                  userId={userId}
                  loadingUser={loadingUser}
                />
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
              <NotValidatedMessage />
            )}
          </Suspense>
          {isMobile && <MobileMenu />}
        </main>
      )}
    </div>
  );
}

export default MainLayout;
