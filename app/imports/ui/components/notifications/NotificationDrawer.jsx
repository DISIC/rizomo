import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import HighlightOff from '@material-ui/icons/HighlightOff';
import ChromeReaderModeOutlinedIcon from '@material-ui/icons/ChromeReaderModeOutlined';
import { Fade, Typography, Tooltip } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import i18n from 'meteor/universe:i18n';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import Spinner from '../system/Spinner';
import Notifications from '../../../api/notifications/notifications';
import { useAppContext } from '../../contexts/context';
import Notification from './Notification';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-start',
  },
  space: {
    margin: 'auto',
  },
  button: {
    padding: 5,
  },
}));

const NotificationDrawer = ({ notifications, ready }) => {
  const classes = useStyles();
  const [{ notificationPage }, dispatch] = useAppContext();
  const [open, setOpen] = useState(false);

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'notificationPage',
      data: {
        ...notificationPage,
        [key]: value,
      },
    });

  const handleDrawerClose = () => updateGlobalState('drawerOpen', false);

  const handleReadAll = () => {
    Meteor.call('notifications.markAllNotificationAsRead', {}, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const handleRemoveAll = () => {
    Meteor.call('notifications.removeAllNotification', {}, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
    setOpen(false);
  };

  const handleRemoveAllRead = () => {
    Meteor.call('notifications.removeAllNotificationRead', {}, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const handleOpenDialog = () => {
    if (notifications.length !== 0) {
      setOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <Fade in>
          <div key="right">
            <Drawer
              anchor="right"
              open={notificationPage.drawerOpen}
              classes={{
                paper: classes.drawerPaper,
              }}
              onClose={handleDrawerClose}
            >
              <div className={classes.drawerHeader}>
                <IconButton onClick={handleDrawerClose}>
                  <ChevronRightIcon />
                </IconButton>
                <Typography variant="button">Notifications</Typography>
                <div className={classes.space} />
                <Tooltip
                  title={i18n.__('components.NotificationsDrawer.removeAllRead')}
                  aria-label={i18n.__('components.NotificationsDrawer.removeAllRead')}
                >
                  <IconButton onClick={handleRemoveAllRead} className={classes.button}>
                    <ChromeReaderModeOutlinedIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={i18n.__('components.NotificationsDrawer.checkAll')}
                  aria-label={i18n.__('components.NotificationsDrawer.checkAll')}
                >
                  <IconButton onClick={handleReadAll} className={classes.button}>
                    <DoneAllIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={i18n.__('components.NotificationsDrawer.removeAll')}
                  aria-label={i18n.__('components.NotificationsDrawer.removeAll')}
                >
                  <IconButton onClick={handleOpenDialog} className={classes.button}>
                    <HighlightOff />
                  </IconButton>
                </Tooltip>

                <Dialog
                  open={open}
                  onClose={handleCloseDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      {i18n.__('components.NotificationsDrawer.confirmRemoveAll')}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                      Non
                    </Button>
                    <Button onClick={handleRemoveAll} color="primary" autoFocus>
                      Oui
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
              <Divider />
              {notifications.map((notif, index) => [
                <Notification key={notif._id} notification={notif} />,
                notifications.length !== index + 1 ? (
                  <Divider className={classes.divider} key={`div-${notif._id}`} />
                ) : null,
              ])}
            </Drawer>
          </div>
        </Fade>
      )}
    </>
  );
};

NotificationDrawer.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('notifications.self');
  const notifications = Notifications.find().fetch() || [];
  return {
    notifications,
    ready: subscription.ready(),
  };
})(NotificationDrawer);
