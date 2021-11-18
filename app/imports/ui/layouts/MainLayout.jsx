import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation, Route, Switch } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import i18n from 'meteor/universe:i18n';
import Alert from '@material-ui/lab/Alert';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import AppSettings from '../../api/appsettings/appsettings';

// components
import SkipLink from '../components/menus/SkipLink';
import TopBar from '../components/menus/TopBar';
import Spinner from '../components/system/Spinner';
import MobileMenu from '../components/menus/MobileMenu';
import NotValidatedMessage from '../components/system/NotValidatedMessage';
import CustomToast from '../components/system/CustomToast';
import { useAppContext } from '../contexts/context';
import NoStructureSelected from '../components/system/NoStructureSelected';
import SiteInMaintenance from '../components/system/SiteInMaintenance';

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
const NotificationsDisplay = lazy(() => import('../components/notifications/NotificationsDisplay'));
const BookmarksPage = lazy(() => import('../pages/groups/BookmarksPage'));

// dynamic imports
const AdminGroupsPage = lazy(() => import('../pages/admin/AdminGroupsPage'));
const AdminSingleGroupPage = lazy(() => import('../pages/admin/AdminSingleGroupPage'));

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
    alertMaintenance: {
      marginTop: -10,
      marginBottom: 30,
    },
  }));

function MainLayout({ appsettings, ready }) {
  const [{ userId, user, loadingUser, isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const location = useLocation();
  const { enableBlog } = Meteor.settings.public;

  const isAdmin = Roles.userIsInRole(userId, 'admin');

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
      {loadingUser && ready ? (
        <Spinner full />
      ) : (
        <main className={classes.content} id="main">
          <Suspense fallback={<Spinner full />}>
            {appsettings.maintenance && isAdmin ? (
              <Alert className={classes.alertMaintenance} variant="filled" severity="error">
                {i18n.__(`layouts.MainLayout.alertMaintenance`)}
              </Alert>
            ) : null}
            {!appsettings.maintenance || isAdmin ? (
              user.isActive ? (
                user.structure !== undefined ? (
                  <Switch>
                    <Route exact path="/" component={PersonalPage} />
                    <Route exact path="/profile" component={ProfilePage} />
                    <Route exact path="/services" component={ServicesPage} />
                    <Route exact path="/structure" component={ServicesPage} />
                    <Route exact path="/help" component={HelpPage} />

                    {enableBlog && <Route exact path="/publications" component={ArticlesPage} />}
                    {enableBlog && <Route exact path="/publications/new" component={EditArticlePage} />}
                    {enableBlog && <Route exact path="/publications/:slug" component={EditArticlePage} />}

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
              )
            ) : (
              <Switch>
                <Route exact path="/" component={SiteInMaintenance} />
                <Route component={SiteInMaintenance} />
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

export default withTracker(() => {
  const subSettings = Meteor.subscribe('appsettings.all');
  const appsettings = AppSettings.findOne();
  const ready = subSettings.ready();
  return {
    appsettings,
    ready,
  };
})(MainLayout);

MainLayout.defaultProps = {
  appsettings: {},
};

MainLayout.propTypes = {
  appsettings: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
