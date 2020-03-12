import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Route, Switch } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import LanguageSwitcher from '../components/system/LanguageSwitcher';
import SignUp from '../pages/system/SignUp';
import SignIn from '../pages/system/SignIn';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    padding: '16px',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/1600x900/?nature)',
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.grey[50],
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
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6),
      paddingRight: 0,
    },
  },
}));

export default function SignLayout() {
  const classes = useStyles();

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid container item xs={false} sm={4} md={7} className={classes.image} spacing={4}>
        <Grid item md={12}>
          <div className={classes.mainFeaturedPostContent} />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <img src="/images/Logo-appseducation.png" className={classes.imgLogo} alt="Logo" />
          <Switch>
            <Route exact path="/signin" component={SignIn} />
            <Route exact path="/signup" component={SignUp} />
          </Switch>
          <LanguageSwitcher />
        </div>
      </Grid>
    </Grid>
  );
}
