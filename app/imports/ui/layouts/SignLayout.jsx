import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Route, Switch } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import LanguageSwitcher from '../components/system/LanguageSwitcher';
import SignUp from '../pages/system/SignUp';
import SignIn from '../pages/system/SignIn';
import Footer from '../components/menus/Footer';
import Contact from '../pages/system/Contact';
import { useAppContext } from '../contexts/context';
import { THEMES } from '../themes/light';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 'calc(100vh - 64px)',
    padding: '16px',
    backgroundImage: THEMES[Meteor.settings.public.theme || 'laboite'].signinBackground,
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.grey[50],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  rootMobile: {
    minHeight: 'calc(100vh - 64px)',
    padding: '16px',
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.primary.light,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imgLogo: {
    alignSelf: 'center',
    maxWidth: '100%',
    maxHeight: 'auto',
    paddingBottom: '5%',
  },
  mainFeaturedPostContent: {
    position: 'relative',
    // padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6),
      paddingRight: 0,
    },
  },
}));

export default function SignLayout() {
  const classes = useStyles();
  const [{ isMobile }] = useAppContext();

  return (
    <>
      <Grid container component="main" className={isMobile ? classes.rootMobile : classes.root}>
        <Grid container item xs={false} sm={4} md={7} spacing={4}>
          <Grid item md={12}>
            <div className={classes.mainFeaturedPostContent} />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <img src="/images/apps-logo-sansfond.svg" className={classes.imgLogo} alt="Logo" />
            <Switch>
              <Route exact path="/signin" component={SignIn} />
              <Route exact path="/signup" component={SignUp} />
              <Route exact path="/contact" component={Contact} />
            </Switch>
            <LanguageSwitcher />
          </div>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}
