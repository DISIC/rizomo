import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation, Route, Switch } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import i18n from 'meteor/universe:i18n';
import Alert from '@material-ui/lab/Alert';
import AppSettings from '../../api/appsettings/appsettings';

// components
import SkipLink from '../components/menus/SkipLink';
import TopBar from '../components/menus/TopBar';
import Spinner from '../components/system/Spinner';
import NotValidatedMessage from '../components/system/NotValidatedMessage';
import CustomToast from '../components/system/CustomToast';
import { useAppContext } from '../contexts/context';
import NoStructureSelected from '../components/system/NoStructureSelected';
import AdminMenu from '../components/admin/AdminMenu';

// pages
const NotificationsDisplay = lazy(() => import('../components/notifications/NotificationsDisplay'));
const ProfilePage = lazy(() => import('../pages/system/ProfilePage'));
const NotFound = lazy(() => import('../pages/system/NotFound'));
const AdminHome = lazy(() => import('../pages/admin/AdminHome'));
const AdminSingleServicePage = lazy(() => import('../pages/admin/AdminSingleServicePage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminTagsPage = lazy(() => import('../pages/admin/AdminTagsPage'));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage'));
const AdminUserValidationPage = lazy(() => import('../pages/admin/AdminUserValidationPage'));
const AdminGroupsPage = lazy(() => import('../pages/admin/AdminGroupsPage'));
const AdminSingleGroupPage = lazy(() => import('../pages/admin/AdminSingleGroupPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminNextcloudUrlPage = lazy(() => import('../pages/admin/AdminNextcloudUrlPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

// CSS
const useStyles = (isMobile) =>
  makeStyles((theme) => ({
    root: {
      display: 'flex',
      position: 'relative',
    },
    content: {
      flexGrow: 1,
      display: 'flex',
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
    alertMaintenance: {
      marginTop: -10,
      marginBottom: 30,
    },
  }));

function AdminLayout() {
  const [{ userId, user, loadingUser, isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const location = useLocation();

  const { appsettings = {}, ready = false } = useTracker(() => {
    const subSettings = Meteor.subscribe('appsettings.all');
    return {
      appsettings: AppSettings.findOne(),
      ready: subSettings.ready(),
    };
  });

  useEffect(() => {
    // Reset focus on all location changes
    if (location.hash !== '#main') {
      document.getElementById('root').focus();
    }
  }, [location]);

  return (
    <div className={classes.root}>
      <SkipLink />
      <TopBar adminApp />
      {loadingUser && ready ? (
        <Spinner full />
      ) : (
        <main className={classes.content} id="main">
          <AdminMenu isMobile={isMobile} />
          <Suspense fallback={<Spinner full />}>
            {appsettings.maintenance ? (
              <Alert className={classes.alertMaintenance} variant="filled" severity="error">
                {i18n.__(`layouts.MainLayout.alertMaintenance`)}
              </Alert>
            ) : null}
            {user.isActive ? (
              user.structure !== undefined ? (
                <Switch>
                  <Route exact path="/admin" component={AdminHome} />
                  <Route exact path="/admin/nextcloudurl" component={AdminNextcloudUrlPage} />
                  <Route exact path="/admin/services" component={AdminServicesPage} />
                  <Route exact path="/admin/services/new" component={AdminSingleServicePage} />
                  <Route exact path="/admin/services/:_id" component={AdminSingleServicePage} />
                  <Route exact path="/admin/users" component={AdminUsersPage} />
                  <Route exact path="/admin/usersvalidation" component={AdminUserValidationPage} />
                  <Route exact path="/admin/categories" component={AdminCategoriesPage} />
                  <Route exact path="/admin/tags" component={AdminTagsPage} userId={userId} loadingUser={loadingUser} />
                  <Route exact path="/admin/settings" component={AdminSettingsPage} />
                  <Route exact path="/admin/groups" component={AdminGroupsPage} />
                  <Route exact path="/admin/groups/new" component={AdminSingleGroupPage} />
                  <Route exact path="/admin/groups/:_id" component={AdminSingleGroupPage} />
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
        </main>
      )}
      <NotificationsDisplay />
      <CustomToast />
    </div>
  );
}

export default AdminLayout;
