import React, { useContext, lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

// components
import TopBar from '../components/menus/TopBar';
import Spinner from '../components/system/Spinner';
import AdminRoute from '../components/system/AdminRoute';
import MobileMenu from '../components/menus/MobileMenu';
import NotValidatedMessage from '../components/system/NotValidatedMessage';
import { Context } from '../contexts/context';

// pages
import ServicesPage from '../pages/services/ServicesPage';
import SingleServicePage from '../pages/services/SingleServicePage';
import GroupsPage from '../pages/groups/GroupsPage';
import NotFound from '../pages/system/NotFound';
import PersonalSpace from '../pages/PersonalSpace';
import SingleGroupPage from '../pages/groups/SingleGroupPage';
import AddressBook from '../pages/groups/AddressBook';
import ProfilePage from '../pages/system/ProfilePage';
import ArticlesPage from '../pages/articles/ArticlesPage';
import EditArticlePage from '../pages/articles/EditArticlePage';

// dynamic imports
const AdminSingleServicePage = lazy(() => import('../pages/admin/AdminSingleServicePage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage'));
const AdminUserValidationPage = lazy(() => import('../pages/admin/AdminUserValidationPage'));
const AdminGroupsPage = lazy(() => import('../pages/admin/AdminGroupsPage'));
const AdminSingleGroupPage = lazy(() => import('../pages/admin/AdminSingleGroupPage'));

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
    marginBottom: isMobile ? 100 : 50,
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
                <Route exact path="/profile" component={ProfilePage} />
                <Route exact path="/services" component={ServicesPage} />
                <Route exact path="/publications" component={ArticlesPage} />
                <Route exact path="/publications/new" component={EditArticlePage} />
                <Route exact path="/publications/:slug" component={EditArticlePage} />
                <Route exact path="/services/:slug" component={SingleServicePage} />
                <Route exact path="/groups" component={GroupsPage} />
                <Route exact path="/groups/:slug" component={SingleGroupPage} />
                <Route exact path="/groups/:slug/addressbook" component={AddressBook} />
                <Route exact path="/admingroups" component={AdminGroupsPage} />
                <Route exact path="/admingroups/new" component={AdminSingleGroupPage} />
                <Route exact path="/admingroups/:_id" component={AdminSingleGroupPage} />
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
