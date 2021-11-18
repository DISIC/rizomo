import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { useHistory, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';
import AppVersion from '../system/AppVersion';
import LogoutDialog from '../system/LogoutDialog';
import UserAvatar from '../users/UserAvatar';
import updateDocumentTitle from '../../utils/updateDocumentTitle';

const useStyles = makeStyles((theme) => ({
  avatar: {
    marginLeft: theme.spacing(1),
  },
  menuItem: {
    '&:hover': {
      color: theme.palette.text.primary,
      // backgroundColor: '#eeeeee',
      backgroundColor: theme.palette.backgroundFocus.main,
      opacity: 1,
      transition: 'all 300ms ease-in-out',
    },
  },
}));

export const adminMenu = [
  {
    path: 'adminDivider',
    content: 'Divider',
  },
  {
    path: '/admin',
    content: 'menuAdminApp',
  },
];

export const userMenu = [
  {
    path: '/medias',
    content: 'menuMedias',
  },
  {
    path: '/userBookmarks',
    content: 'menuUserBookmarks',
  },
];

export const userGroups = [
  // for admin users, group management is in admin section
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
  const isAdminStructure = Roles.userIsInRole(user._id, 'adminStructure', user.structure);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleMenuClick = (item) => {
    updateDocumentTitle(i18n.__(`components.MainMenu.${item.content}`));
    history.push(item.path);
    setAnchorEl(null);
  };
  let menu;
  if (isAdmin || isAdminStructure) {
    menu = [...userMenu, ...adminMenu];
  } else {
    menu = [...userMenu, ...userGroups];
  }
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
    updateDocumentTitle('');
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
        <UserAvatar userAvatar={user.avatar || ''} userFirstName={user.firstName || ''} customClass={classes.avatar} />
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
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleMenuClick({ path: '/profile', content: 'menuProfileLabel' })}
          selected={pathname === '/profile'}
        >
          {i18n.__('components.MainMenu.menuProfileLabel')}
        </MenuItem>

        <MenuItem className={classes.menuItem} onClick={onLogout}>
          {i18n.__('components.MainMenu.menuLogoutLabel')}
        </MenuItem>
        <Divider />
        {menu.map((item) => {
          return item.content === 'Divider' ? (
            <Divider key={item.path} />
          ) : (
            <MenuItem
              className={classes.menuItem}
              key={item.path}
              onClick={() => handleMenuClick(item)}
              selected={currentLink ? currentLink.path === item.path : false}
            >
              {i18n.__(`components.MainMenu.${item.content}`)}
            </MenuItem>
          );
        })}
        <Divider />
        <MenuItem disabled style={{ opacity: 1 }}>
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
