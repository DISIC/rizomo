import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import { IconButton } from '@material-ui/core';
import NotificationsBell from '../notifications/NotificationsBell';
import MenuBar from './MenuBar';
import MainMenu from './MainMenu';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.tertiary.main,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minHeight: 48,
  },
  imgLogo: {
    maxHeight: '30px',
    height: 30,
    outline: 'none',
  },
  grow: {
    flexGrow: 1,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rightContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItem: 'center',
  },
}));

const SMALL_LOGO = 'Logo-A.svg';
const LONG_LOGO = 'apps-logo-sansfond.svg';

function TopBar({ publicMenu, root }) {
  const [{ isMobile, user, notificationPage }, dispatch] = useAppContext();
  const classes = useStyles();
  const LOGO = `/images/${isMobile ? SMALL_LOGO : LONG_LOGO}`;

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'notificationPage',
      data: {
        ...notificationPage,
        [key]: value,
      },
    });

  const handleNotifsOpen = () => {
    const notifState = notificationPage.notifsOpen || false;
    if (notifState) {
      // On notifs close : mark all as read
      Meteor.call('notifications.markAllNotificationAsRead', {}, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
    updateGlobalState('notifsOpen', !notifState);
  };

  return (
    <AppBar position="fixed" className={classes.root}>
      <Link to={root || (publicMenu ? '/public' : '/')} className={classes.imgLogo}>
        <img src={LOGO} className={classes.imgLogo} alt="Logo" />
      </Link>

      {!isMobile && !publicMenu && <MenuBar />}
      <div className={classes.rightContainer}>
        {publicMenu ? null : (
          <>
            <MainMenu user={user} />
            <IconButton onClick={() => handleNotifsOpen()}>
              <NotificationsBell />
            </IconButton>
          </>
        )}
      </div>
    </AppBar>
  );
}

export default TopBar;

TopBar.propTypes = {
  publicMenu: PropTypes.bool,
  root: PropTypes.string,
};

TopBar.defaultProps = {
  publicMenu: false,
  root: null,
};
