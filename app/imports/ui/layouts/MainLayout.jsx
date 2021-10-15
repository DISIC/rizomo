import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation, Route, Switch } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

// components
import SkipLink from '../components/menus/SkipLink';
import TopBar from '../components/menus/TopBar';
import Spinner from '../components/system/Spinner';
import AdminRoute from '../components/system/AdminRoute';
import StructureAdminRoute from '../components/system/StructureAdminRoute';
import MobileMenu from '../components/menus/MobileMenu';
import NotValidatedMessage from '../components/system/NotValidatedMessage';
import CustomToast from '../components/system/CustomToast';
import { useAppContext } from '../contexts/context';
import NoStructureSelected from '../components/system/NoStructureSelected';

// pages
const ServicesPage = lazy(() => import('../pages/services/ServicesPage'));
const HelpPage = lazy(() => import('../pages/HelpPage'));
const SingleServicePage = lazy(() => import('../pages/services/SingleServicePage'));
const GroupsPage = lazy(() => import('../pages/groups/GroupsPage'));
const NotFound = lazy(() => import('../pages/system/NotFound'));
const PersonalPage = lazy(() => import('../pages/PersonalPage'));
const SingleGroupPage = lazy(() => import('../pages/groups/SingleGroupPage'));
const AddressBook = lazy(() => import('../pages/groups/AddressBook'));
const EventsPage = lazy(() => import('../pages/groups/EventsPage'));
const PollPage = lazy(() => import('../pages/groups/PollPage'));
const ProfilePage = lazy(() => import('../pages/system/ProfilePage'));
const ArticlesPage = lazy(() => import('../pages/articles/ArticlesPage'));
const EditArticlePage = lazy(() => import('../pages/articles/EditArticlePage'));
const MediaStoragePage = lazy(() => import('../pages/MediaStoragePage'));
const UserBookmarksPage = lazy(() => import('../pages/users/UserBookmarksPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const NotificationsDisplay = lazy(() => import('../components/notifications/NotificationsDisplay'));
const AdminNextcloudUrlPage = lazy(() => import('../pages/admin/AdminNextcloudUrlPage'));
const BookmarksPage = lazy(() => import('../pages/groups/BookmarksPage'));

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
      overflow: 'hidden',
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
  const location = useLocation();

  useEffect(() => {
    // Reset focus on all location changes
    if (location.hash !== '#main') {
      document.getElementById('root').focus();
    }
  }, [location]);

  return (
    <div className={classes.root}>
      <SkipLink />
      <TopBar />
      {loadingUser ? (
        <Spinner full />
      ) : (
        <main className={classes.content} id="main">
          <Suspense fallback={<Spinner full />}>
            {user.isActive ? (
              user.structure !== undefined ? (
                <Switch>
                  <Route exact path="/" component={PersonalPage} />
                  <Route exact path="/profile" component={ProfilePage} />
                  <Route exact path="/services" component={ServicesPage} />
                  <Route exact path="/structure" component={ServicesPage} />
                  <Route exact path="/publications" component={ArticlesPage} />
                  <Route exact path="/help" component={HelpPage} />
                  <Route exact path="/publications/new" component={EditArticlePage} />
                  <Route exact path="/publications/:slug" component={EditArticlePage} />
                  <Route exact path="/services/:slug" component={SingleServicePage} />
                  <Route exact path="/structure/:slug" component={SingleServicePage} />
                  <Route exact path="/groups" component={GroupsPage} />
                  <Route exact path="/groups/:slug" component={SingleGroupPage} />
                  <Route exact path="/groups/:slug/addressbook" component={AddressBook} />
                  <Route exact path="/groups/:slug/events" component={EventsPage} />
                  <Route exact path="/groups/:slug/poll" component={PollPage} />
                  <Route exact path="/groups/:slug/bookmarks" component={BookmarksPage} />
                  <Route exact path="/admingroups" component={AdminGroupsPage} />
                  <Route exact path="/admingroups/new" component={AdminSingleGroupPage} />
                  <Route exact path="/admingroups/:_id" component={AdminSingleGroupPage} />
                  <Route exact path="/medias" component={MediaStoragePage} />
                  <Route exact path="/userBookmarks" component={UserBookmarksPage} />
                  <StructureAdminRoute
                    exact
                    path="/adminstructureusers"
                    component={AdminStructureUsersPage}
                    user={user}
                    loadingUser={loadingUser}
                  />
                  <StructureAdminRoute
                    exact
                    path="/adminstructureservices"
                    component={AdminServicesPage}
                    user={user}
                    loadingUser={loadingUser}
                  />
                  <StructureAdminRoute
                    exact
                    path="/adminstructureservices/new"
                    component={AdminSingleServicePage}
                    user={user}
                    loadingUser={loadingUser}
                  />
                  <StructureAdminRoute
                    exact
                    path="/adminstructureservices/:_id"
                    component={AdminSingleServicePage}
                    user={user}
                    loadingUser={loadingUser}
                  />
                  <AdminRoute
                    exact
                    path="/adminextcloudurl"
                    component={AdminNextcloudUrlPage}
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
                  <AdminRoute
                    path="/settings"
                    component={AdminSettingsPage}
                    userId={userId}
                    loadingUser={loadingUser}
                  />
                  <Route component={NotFound} />
                </Switch>
              ) : (
                <Switch>
                  <Route exact path="/profile" component={ProfilePage} />
                  <Route component={NoStructureSelected} />
                </Switch>
              )
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
