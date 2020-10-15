/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Avatar, makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const UserAvatar = ({ user, customClass }) => {
  const classes = useStyles();
  const getClasse = () => {
    if (customClass) return customClass;
    if (user.avatar) return '';
    return classes.avatar;
  };
  return <Avatar alt={user.firstName} src={user.avatar || user.firstName} className={getClasse()} />;
};

UserAvatar.defaultProps = {
  customClass: '',
};

UserAvatar.propTypes = {
  customClass: PropTypes.string,
  user: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default UserAvatar;
