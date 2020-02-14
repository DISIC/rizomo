import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Menu, MenuItem } from '@material-ui/core';

const adminMenu = [
  {
    path: '/adminservices',
    content: 'menuAdminServices',
  },
  {
    path: '/admincategories',
    content: 'menuAdminCategories',
  },
  {
    path: '/usersvalidation',
    content: 'menuAdminUserValidation',
  },
];

function AdminMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const history = useHistory();
  const { pathname } = useLocation();
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleMenuClick = (path) => {
    history.push(path);
    setAnchorEl(null);
  };
  const T = i18n.createComponent('components.AdminMenu');
  const currentLink = adminMenu.find((link) => {
    if (link.path === pathname || pathname.search(link.path) > -1) {
      return true;
    }
    return false;
  });

  return (
    <>
      <Button aria-controls="admin-menu" aria-haspopup="true" onClick={handleClick}>
        Admin
      </Button>
      <Menu
        id="admin-menu"
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
        {adminMenu.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleMenuClick(item.path)}
            selected={currentLink ? currentLink.path === item.path : false}
          >
            <T>{item.content}</T>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default AdminMenu;
