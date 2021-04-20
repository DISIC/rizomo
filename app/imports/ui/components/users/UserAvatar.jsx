/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const UserAvatar = ({ userAvatar, userFirstName, customClass }) => {
  const classes = useStyles();
  const getClasse = () => {
    if (customClass) return customClass;
    if (userAvatar) return '';
    return classes.avatar;
  };
  return <Avatar alt={userFirstName} src={userAvatar || userFirstName} className={getClasse()} />;
};

UserAvatar.defaultProps = {
  customClass: '',
};

UserAvatar.propTypes = {
  customClass: PropTypes.string,
  userAvatar: PropTypes.string.isRequired,
  userFirstName: PropTypes.string.isRequired,
};

export default UserAvatar;
