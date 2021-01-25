import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import Badge from '@material-ui/core/Badge';
import { toast } from 'react-toastify';
import Notifications from '../../../api/notifications/notifications';
import Notification from './Notification';
import notificationSystem from './NotificationSystem';

const useStyles = makeStyles((theme) => ({
  badge: {
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const NotificationsBell = ({ nonReadNotifsCount }) => {
  const classes = useStyles();
  return (
    <div id="NotificationsBell">
      {nonReadNotifsCount > 0 ? (
        <Badge className={classes.badge} badgeContent={nonReadNotifsCount} color="primary">
          <NotificationsIcon />
        </Badge>
      ) : (
        <NotificationsNoneIcon />
      )}
    </div>
  );
};

export default withTracker(() => {
  Meteor.subscribe('notifications.self');
  const notifs = Notifications.find({ userId: Meteor.userId(), createdAt: { $gt: new Date() } });

  notifs.observe({
    added(notif) {
      if (document.hasFocus()) {
        toast(<Notification notification={notif} toast />);
      } else {
        notificationSystem(notif.title, { body: notif.content });
      }
    },
  });

  const notifications = Notifications.find({}, { sort: { createdAt: -1 } }).fetch() || [];
  const nonReadNotifsCount = Notifications.find({ userId: Meteor.userId(), read: false }).count();
  return {
    nonReadNotifsCount,
    notifications,
  };
})(NotificationsBell);

NotificationsBell.propTypes = { nonReadNotifsCount: PropTypes.number.isRequired };
