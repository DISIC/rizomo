import React, { useContext } from 'react';
import i18n from 'meteor/universe:i18n';
import { useLocation, useHistory } from 'react-router-dom';
import { Roles } from 'meteor/alanning:roles';
import { Tabs, Tab, makeStyles } from '@material-ui/core';
import { Context } from '../contexts/context';

const links = [
  {
    path: '/',
    content: 'menuMyspace',
    admin: false,
  },
  {
    path: '/services',
    content: 'menuServices',
    admin: false,
  },
  {
    path: '/groups',
    content: 'menuGroupes',
    admin: false,
  },
  {
    path: '/adminservices',
    content: 'menuAdminServices',
    admin: true,
  },
  {
    path: '/usersvalidation',
    content: 'menuAdminUserValidation',
    admin: true,
  },
];

const useStyles = makeStyles((theme) => ({
  tabs: {
    margin: 'auto',
    color: theme.palette.text.primary,
  },
}));

function MenuBar() {
  const [{ userId }] = useContext(Context);
  const { pathname } = useLocation();
  const history = useHistory();
  const classes = useStyles();
  const isAdmin = Roles.userIsInRole(userId, 'admin');
  const T = i18n.createComponent('components.MenuBar');
  const currentLink = links.find((link) => {
    if (link.path === pathname || (pathname.search(link.path) > -1 && link.path !== '/')) {
      return true;
    }
    return false;
  });

  return (
    <Tabs
      className={classes.tabs}
      value={currentLink ? currentLink.path : false}
      indicatorColor="primary"
      textColor="primary"
      aria-label="menu links"
    >
      {links.map((link) => {
        if ((link.admin && isAdmin) || !link.admin) {
          return (
            <Tab
              key={link.path}
              value={link.path}
              label={<T>{link.content}</T>}
              onClick={() => history.push(link.path)}
            />
          );
        }
        return null;
      })}
    </Tabs>
  );
}

export default MenuBar;

MenuBar.propTypes = {};
