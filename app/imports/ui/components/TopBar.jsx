import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { useHistory, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Toolbar from '@material-ui/core/Toolbar';
import { Button, Divider } from '@material-ui/core';

import LanguageSwitcher from './LanguageSwitcher';
import MenuBar from './MenuBar';
import AdminMenu from './AdminMenu';
import { Context } from '../contexts/context';

const useStyles = makeStyles(() => ({
  imgLogo: {
    maxHeight: '30px',
    height: 'auto',
  },
  grow: {
    flexGrow: 1,
  },
}));

function TopBar() {
  const [{ userId }] = useContext(Context);
  const classes = useStyles();
  const history = useHistory();
  const isAdmin = Roles.userIsInRole(userId, 'admin');

  const handleLogout = () => {
    Meteor.logout(() => history.push('/'));
  };

  return (
    <AppBar position="fixed" color="secondary">
      <Toolbar>
        <Link to="/">
          <img src="/images/Logo-appseducation.png" className={classes.imgLogo} alt="Logo" />
        </Link>
        <div className={classes.grow} />
        <LanguageSwitcher topbar />
        <Button onClick={() => console.log('go profile')} startIcon={<AccountCircle />}>
          {i18n.__('components.TopBar.myAccount')}
        </Button>
        {isAdmin && <AdminMenu />}
        <Button onClick={handleLogout}>{i18n.__('components.TopBar.menuLogoutLabel')}</Button>
      </Toolbar>
      <Divider />
      <MenuBar />
    </AppBar>
  );
}

export default TopBar;
