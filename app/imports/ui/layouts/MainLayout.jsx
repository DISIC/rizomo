import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

// components
import TopBar from '../components/menus/TopBar';
import Spinner from '../components/system/Spinner';
import AdminRoute from '../components/system/AdminRoute';
import StructureAdminRoute from '../components/system/StructureAdminRoute';
import MobileMenu from '../components/menus/MobileMenu';
import NotValidatedMessage from '../components/system/NotValidatedMessage';
import CustomToast from '../components/system/CustomToast';
import { useAppContext } from '../contexts/context';

// pages
const ServicesPage = lazy(() => import('../pages/services/ServicesPage'));
const HelpPage = lazy(() => import('../pages/HelpPage'));
const SingleServicePage = lazy(() => import('../pages/services/SingleServicePage'));
const GroupsPage = lazy(() => import('../pages/groups/GroupsPage'));
const NotFound = lazy(() => import('../pages/system/NotFound'));
const PersonalPage = lazy(() => import('../pages/PersonalPage'));
const SingleGroupPage = lazy(() => import('../pages/groups/SingleGroupPage'));
const AddressBook = lazy(() => import('../pages/groups/AddressBook'));
const ProfilePage = lazy(() => import('../pages/system/ProfilePage'));
const ArticlesPage = lazy(() => import('../pages/articles/ArticlesPage'));
const EditArticlePage = lazy(() => import('../pages/articles/EditArticlePage'));
const MediaStoragePage = lazy(() => import('../pages/MediaStoragePage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const NotificationsDisplay = lazy(() => import('../components/notifications/NotificationsDisplay'));

// dynamic imports
const AdminSingleServicePage = lazy(() => import('../pages/admin/AdminSingleServicePage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminTagsPage = lazy(() => import('../pages/admin/AdminTagsPage'));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage'));
const AdminUserValidationPage = lazy(() => import('../pages/admin/AdminUserValidationPage'));
const AdminGroupsPage = lazy(() => import('../pages/admin/AdminGroupsPage'));
const AdminSingleGroupPage = lazy(() => import('../pages/admin/AdminSingleGroupPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminStructureUsersPage = lazy(() => import('../pages/structure/AdminStructureUsersPage'));

// CSS
const useStyles = (isMobile) =>
  makeStyles((theme) => ({
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
      overflowX: 'hidden',
      marginTop: 60,
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
  const [{ userId, user, loadingUser, isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();

  return (
    <div className={classes.root}>
      <TopBar />
      {loadingUser ? (
        <Spinner full />
      ) : (
        <main className={classes.content}>
          <Suspense fallback={<Spinner full />}>
            {user.isActive ? (
              <Switch>
                <Route exact path="/" component={PersonalPage} />
                <Route exact path="/profile" component={ProfilePage} />
                <Route exact path="/services" component={ServicesPage} />
                <Route exact path="/publications" component={ArticlesPage} />
                <Route exact path="/help" component={HelpPage} />
                <Route exact path="/publications/new" component={EditArticlePage} />
                <Route exact path="/publications/:slug" component={EditArticlePage} />
                <Route exact path="/services/:slug" component={SingleServicePage} />
                <Route exact path="/groups" component={GroupsPage} />
                <Route exact path="/groups/:slug" component={SingleGroupPage} />
                <Route exact path="/groups/:slug/addressbook" component={AddressBook} />
                <Route exact path="/admingroups" component={AdminGroupsPage} />
                <Route exact path="/admingroups/new" component={AdminSingleGroupPage} />
                <Route exact path="/admingroups/:_id" component={AdminSingleGroupPage} />
                <Route exact path="/medias" component={MediaStoragePage} />
                <StructureAdminRoute
                  exact
                  path="/adminstructureusers"
                  component={AdminStructureUsersPage}
                  user={user}
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
                <AdminRoute path="/adminusers" component={AdminUsersPage} userId={userId} loadingUser={loadingUser} />
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
                <AdminRoute path="/admintags" component={AdminTagsPage} userId={userId} loadingUser={loadingUser} />
                <AdminRoute path="/settings" component={AdminSettingsPage} userId={userId} loadingUser={loadingUser} />
                <Route component={NotFound} />
              </Switch>
            ) : (
              <Switch>
                <Route exact path="/profile" component={ProfilePage} />
                <Route component={NotValidatedMessage} />
              </Switch>
            )}
          </Suspense>
          {isMobile && <MobileMenu />}
        </main>
      )}
      <NotificationsDisplay />
      <CustomToast />
    </div>
  );
}

export default MainLayout;
