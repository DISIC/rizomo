import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import { Fade, Typography, Paper, Popper } from '@material-ui/core';
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

const useStyles = makeStyles((theme) => ({
  popper: {
    zIndex: 1300,
    marginTop: 20,
  },
  paper: {
    width: 400,
    outline: 'none',
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(1),
  },
  notifsList: {
    overflowY: 'scroll',
    maxHeight: 400,
  },
  notifsListEmpty: {},
  divflex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginLeft: theme.spacing(7),
  },
  footer: {
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
    },
  },
}));

const NotificationsDisplay = ({ notifications, ready }) => {
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

  const handleNotifsClose = () => {
    // On notifs close : mark all as read
    Meteor.call('notifications.markAllNotificationAsRead', {}, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
    updateGlobalState('notifsOpen', false);
  };

  const handleRemoveAll = () => {
    Meteor.call('notifications.removeAllNotification', {}, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
    setOpen(false);
    updateGlobalState('notifsOpen', false);
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
        <Popper
          className={classes.popper}
          open={notificationPage.notifsOpen || false}
          onClose={handleNotifsClose}
          anchorEl={document.getElementById('NotificationsBell')}
          placement="bottom-end"
        >
          <Fade in={notificationPage.notifsOpen}>
            <Paper className={classes.paper}>
              <div className={classes.divflex}>
                <Typography variant="h6" className={classes.title}>
                  Notifications
                </Typography>
                <IconButton onClick={handleNotifsClose}>
                  <CancelIcon />
                </IconButton>
              </div>

              <Dialog
                open={open}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {i18n.__('components.NotificationsDisplay.confirmRemoveAll')}
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
              <Divider />
              <div className={notifications.length < 4 ? classes.notifsListEmpty : classes.notifsList}>
                {notifications.map((notif, index) => [
                  <Notification key={notif._id} notification={notif} />,
                  notifications.length !== index + 1 ? (
                    <Divider className={classes.divider} key={`div-${notif._id}`} />
                  ) : null,
                ])}
              </div>
              {notifications.length === 0 ? (
                <Typography className={classes.footer} variant="body2">
                  {i18n.__('components.NotificationsDisplay.empty')}
                </Typography>
              ) : (
                <div className={classes.footer}>
                  <Button className={classes.button} variant="body2" onClick={handleOpenDialog}>
                    {i18n.__('components.NotificationsDisplay.removeAll')}
                  </Button>
                </div>
              )}
            </Paper>
          </Fade>
        </Popper>
      )}
    </>
  );
};

NotificationsDisplay.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('notifications.self');
  const notifications = Notifications.find({}, { sort: { createdAt: -1 } }).fetch() || [];
  return {
    notifications,
    ready: subscription.ready(),
  };
})(NotificationsDisplay);
