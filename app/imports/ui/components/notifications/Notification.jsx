import React from 'react';
import PropTypes from 'prop-types';
import InfoIcon from '@material-ui/icons/Info';
import HelpIcon from '@material-ui/icons/Help';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import GroupIcon from '@material-ui/icons/Group';
import CloseIcon from '@material-ui/icons/Close';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  makeStyles,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import i18n from 'meteor/universe:i18n';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'inline',
  },
  button: {
    display: 'block',
    margin: 0,
    padding: 0,
  },
  buttonMargin: {
    display: 'block',
    margin: 0,
    marginTop: 8,
    padding: 0,
  },
  rightIcon: {
    marginTop: 8,
    marginLeft: 10,
  },
  leftIcon: {
    minWidth: 40,
  },
}));

const Notification = ({ notification, toast }) => {
  const { _id, type, title, content, createdAt, read } = notification;
  const classes = useStyles();
  const handleToggle = () => {
    Meteor.call('notifications.markNotificationAsRead', { notificationId: _id }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const handleRemove = () => {
    Meteor.call('notifications.removeNotification', { notificationId: _id }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const notifIcon = () => {
    switch (type) {
      case 'setRole':
        return <PersonAddIcon />;
      case 'unsetRole':
        return <PersonAddDisabledIcon />;
      case 'request':
        return <HelpIcon />;
      case 'group':
        return <GroupIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <ListItem alignItems="flex-start">
      <ListItemIcon className={classes.leftIcon}>{notifIcon()}</ListItemIcon>
      <ListItemText
        primary={
          <>
            {title}
            &nbsp;
            <Typography component="span" variant="caption" className={classes.inline} color="textSecondary">
              {createdAt.toLocaleDateString()}
            </Typography>
          </>
        }
        secondary={content}
      />
      {toast ? null : (
        <div className={classes.rightIcon}>
          <Tooltip
            title={i18n.__('components.Notifications.remove')}
            aria-label={i18n.__('components.Notifications.remove')}
          >
            <IconButton onClick={handleRemove} className={classes.button}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={i18n.__('components.Notifications.check')}
            aria-label={i18n.__('components.Notifications.check')}
          >
            <Checkbox
              edge="end"
              onChange={handleToggle}
              checked={read}
              disabled={read}
              className={classes.buttonMargin}
            />
          </Tooltip>
        </div>
      )}
    </ListItem>
  );
};

Notification.propTypes = {
  notification: PropTypes.objectOf(PropTypes.any).isRequired,
  toast: PropTypes.bool,
};

Notification.defaultProps = {
  toast: false,
};

export default Notification;
