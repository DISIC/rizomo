import React from 'react';
import i18n from 'meteor/universe:i18n';
import { useLocation, useHistory } from 'react-router-dom';
import { Tabs, Tab, makeStyles } from '@material-ui/core';

const links = [
  {
    path: '/',
    content: 'menuMyspace',
    admin: false,
  },
  {
    path: '/groups',
    content: 'menuGroupes',
    admin: false,
  },
  {
    path: '/services',
    content: 'menuServices',
    admin: false,
  },
];

const useStyles = makeStyles((theme) => ({
  tabs: {
    margin: 'auto',
    color: theme.palette.text.primary,
  },
}));

function MenuBar() {
  const { pathname } = useLocation();
  const history = useHistory();
  const classes = useStyles();
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
      {links.map((link) => (
        <Tab key={link.path} value={link.path} label={<T>{link.content}</T>} onClick={() => history.push(link.path)} />
      ))}
    </Tabs>
  );
}

export default MenuBar;

MenuBar.propTypes = {};
