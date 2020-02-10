import React from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Toolbar from '@material-ui/core/Toolbar';
import { Button, Divider } from '@material-ui/core';
import LanguageSwitcher from './LanguageSwitcher';
import MenuBar from './MenuBar';

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
  const classes = useStyles();
  const history = useHistory();

  const handleLogout = () => {
    Meteor.logout(() => history.push('/'));
  };

  return (
    <AppBar position="fixed" color="secondary">
      <Toolbar>
        <img src="/images/Logo-appseducation.png" className={classes.imgLogo} alt="Logo" />
        <div className={classes.grow} />
        <LanguageSwitcher topbar />
        <Button onClick={() => console.log('go profile')} startIcon={<AccountCircle />}>
          {i18n.__('components.TopBar.myAccount')}
        </Button>
        <Button onClick={handleLogout}>{i18n.__('components.TopBar.menuLogoutLabel')}</Button>
      </Toolbar>
      <Divider />
      <MenuBar />
    </AppBar>
  );
}

export default TopBar;
