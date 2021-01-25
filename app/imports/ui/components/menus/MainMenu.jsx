import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Menu, MenuItem, Divider, makeStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';
import AppVersion from '../system/AppVersion';
import LogoutDialog from '../system/LogoutDialog';
import UserAvatar from '../users/UserAvatar';

const useStyles = makeStyles((theme) => ({
  avatar: {
    marginLeft: theme.spacing(1),
  },
}));

export const adminMenu = [
  {
    path: '/adminservices',
    content: 'menuAdminServices',
  },
  {
    path: '/admincategories',
    content: 'menuAdminCategories',
  },
  {
    path: '/admintags',
    content: 'menuAdminTags',
  },
  {
    path: '/adminusers',
    content: 'menuAdminUsers',
  },
  {
    path: '/usersvalidation',
    content: 'menuAdminUserValidation',
  },
  {
    path: '/settings',
    content: 'menuAdminAppSettings',
  },
];

export const userMenu = [
  {
    path: '/medias',
    content: 'menuMedias',
  },
  {
    path: '/publications',
    content: 'menuPublications',
  },
  {
    path: '/admingroups',
    content: 'menuAdminGroups',
  },
];

const MainMenu = ({ user = {} }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogout, setOpenLogout] = useState(false);
  const history = useHistory();
  const { pathname } = useLocation();
  const isAdmin = Roles.userIsInRole(user._id, 'admin');
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleMenuClick = (path) => {
    history.push(path);
    setAnchorEl(null);
  };
  let menu;
  if (isAdmin) {
    menu = [...userMenu, ...adminMenu];
  } else {
    menu = [...userMenu];
  }
  const T = i18n.createComponent('components.MainMenu');
  const currentLink = menu.find((link) => {
    if (link.path === pathname || pathname.search(link.path) > -1) {
      return true;
    }
    return false;
  });

  const keycloakLogout = () => {
    const { keycloakUrl, keycloakRealm } = Meteor.settings.public;
    const keycloakLogoutUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`;
    const redirectUri = `${Meteor.absoluteUrl()}/logout`;
    window.location = `${keycloakLogoutUrl}?post_logout_redirect_uri=${redirectUri}`;
  };

  const closeLogoutDialog = () => {
    setOpenLogout(false);
    setAnchorEl(null);
  };

  const onLogout = () => {
    if (Meteor.settings.public.enableKeycloak) {
      const logoutType = user.logoutType || 'ask';
      if (logoutType === 'ask') {
        setOpenLogout(true);
      } else if (logoutType === 'global') {
        keycloakLogout();
      } else Meteor.logout();
    } else {
      Meteor.logout();
    }
  };

  return (
    <>
      <Button
        aria-controls="main-menu"
        aria-haspopup="true"
        onClick={handleClick}
        style={{ textTransform: 'none' }}
        endIcon={<ExpandMoreIcon />}
      >
        {user.firstName || ''}
        {user.avatar ? <UserAvatar user={user} customClass={classes.avatar} /> : null}
      </Button>
      <Menu
        id="main-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => handleMenuClick('/profile')} selected={pathname === '/profile'}>
          <T>menuProfileLabel</T>
        </MenuItem>

        <MenuItem onClick={onLogout}>
          <T>menuLogoutLabel</T>
        </MenuItem>
        <Divider />
        {menu.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleMenuClick(item.path)}
            selected={currentLink ? currentLink.path === item.path : false}
          >
            <T>{item.content}</T>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem>
          <AppVersion />
        </MenuItem>
      </Menu>
      <LogoutDialog open={openLogout} onClose={closeLogoutDialog} onAccept={keycloakLogout} />
    </>
  );
};

export default MainMenu;

MainMenu.propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
};

MainMenu.defaultProps = {
  user: {},
};
