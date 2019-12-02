import React from 'react';
import { Route, Switch } from 'react-router-dom';
import clsx from 'clsx';

import { makeStyles, useTheme, fade } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import TopBar from '../components/TopBar';
import LeftDrawer from '../components/LeftDrawer';
import ServicesPage from '../pages/ServicesPage';

const drawerWidth = 240;

export default function MainLayout() {
  const classes = useStyles();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />
      <LeftDrawer setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: drawerOpen,
        })}
      >
        <Switch>
          <Route path="/" component={ServicesPage} />
        </Switch>
      </main>
    </div>
  );
}

// CSS

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    position: 'relative',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));
