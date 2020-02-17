import React from 'react';
import i18n from 'meteor/universe:i18n';
import {
  Typography, Container, Grid, makeStyles, Fade,
} from '@material-ui/core';
import clsx from 'clsx';

// import { Context } from '../contexts/context';

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  welcome: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const PersonalSpace = () => {
  //   const [{ user, loadingUser }] = useContext(Context);
  const classes = useStyles();

  return (
    <Fade in>
      <Container className={clsx(classes.cardGrid, 'page')}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12} className={classes.welcome}>
            <Typography variant="h4">{i18n.__('pages.PersonalSpace.welcome')}</Typography>
            <img src="http://waynecountyfairohio.com/wp-content/uploads/2015/03/ComingSoon.png" alt="coming soon" />
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default PersonalSpace;
