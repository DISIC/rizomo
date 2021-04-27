import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import MenuBar from './MenuBar';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.tertiary.main,
    bottom: 0,
    top: 'auto',
  },
}));

const MobileMenu = () => {
  const classes = useStyles();
  return (
    <AppBar position="fixed" className={classes.root}>
      <MenuBar mobile />
    </AppBar>
  );
};

export default MobileMenu;
