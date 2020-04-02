import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Button, Menu, MenuItem, Divider,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';
import AppVersion from '../system/AppVersion';

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
    path: '/adminusers',
    content: 'menuAdminUsers',
  },
  {
    path: '/usersvalidation',
    content: 'menuAdminUserValidation',
  },
];

export const userMenu = [
  {
    path: '/admingroups',
    content: 'menuAdminGroups',
  },
];

const MainMenu = ({ user = {} }) => {
  const [anchorEl, setAnchorEl] = useState(null);
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

        <MenuItem onClick={() => Meteor.logout()}>
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
