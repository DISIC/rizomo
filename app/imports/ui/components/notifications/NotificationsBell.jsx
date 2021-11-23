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
import { badgeStyle } from '../groups/GroupBadge';

const useStyles = makeStyles((theme) => badgeStyle(theme));

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
