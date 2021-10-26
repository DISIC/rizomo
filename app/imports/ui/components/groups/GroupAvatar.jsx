/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import PeopleIcon from '@material-ui/icons/People';
import LockIcon from '@material-ui/icons/Lock';
import SecurityIcon from '@material-ui/icons/Security';
import Badge from '@material-ui/core/Badge';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles((theme) => ({
  badge: {
    borderRadius: '50%',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    padding: '4px',
    color: '#FFFFFF',
  },
  public: {
    backgroundColor: theme.palette.primary.main,
  },
  moderate: {
    backgroundColor: theme.palette.secondary.main,
  },
  private: {
    backgroundColor: '#cf3429',
  },
  avatar: {
    width: 250,
    height: 250,
  },
  avatarMobile: {
    width: 120,
    height: 120,
  },
  iconProfil: {
    fontSize: 100,
  },
}));

const GroupAvatar = ({ type, avatar, profil }) => {
  const classes = useStyles();
  const [{ isMobile }] = useAppContext();
  const getClasse = () => {
    const typeClasse = type === 0 ? 'public' : type === 10 ? 'private' : 'moderate';
    if (avatar === '') {
      const allClasses = `${classes[`${typeClasse}`]} ${classes[`${profil === 'true' ? 'iconProfil' : ''}`]}`;
      return allClasses;
    }
    const allClasses = `${classes.badge} ${classes[`${typeClasse}`]} avatar`;
    return allClasses;
  };

  const avatarIcon =
    type === 0 ? (
      <PeopleIcon className={getClasse()} />
    ) : type === 10 ? (
      <LockIcon className={getClasse()} />
    ) : (
      <SecurityIcon className={getClasse()} />
    );

  return avatar === '' || undefined ? (
    <Avatar
      className={`${getClasse()} ${classes[`${profil === 'true' ? (isMobile ? 'avatarMobile' : 'avatar') : ''}`]}`}
    >
      {avatarIcon}
    </Avatar>
  ) : (
    <Badge
      overlap="circular"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      badgeContent={avatarIcon}
    >
      <Avatar
        alt="group"
        src={avatar}
        className={classes[`${profil === 'true' ? (isMobile ? 'avatarMobile' : 'avatar') : ''}`]}
      />
    </Badge>
  );
};

GroupAvatar.defaultProps = {
  avatar: '',
  profil: '',
};

GroupAvatar.propTypes = {
  type: PropTypes.number.isRequired,
  avatar: PropTypes.string,
  profil: PropTypes.string,
};

export default GroupAvatar;
