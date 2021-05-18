import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../contexts/context';

export default function Animation() {
  const [{ isMobile }] = useAppContext();

  const useStyles = makeStyles({
    grid: {
      display: 'grid',
      justifyContent: 'center',
      padding: '20px',
      marginLeft: isMobile ? '15%' : '0px',
      maxWidth: '70vw',
    },
    iframe: {
      width: isMobile ? '90vw' : '55vw',
      height: isMobile ? '50vmin' : '55vh',
    },
  });
  const classes = useStyles();

  return (
    <Grid className={classes.grid}>
      <iframe
        className={classes.iframe}
        title="screencast_frame"
        sandbox="allow-same-origin allow-scripts allow-popups"
        src="https://tube-dijon.beta.education.fr/videos/embed/940b6b1f-09b6-4995-a86a-a1901cd8ae21"
        allowFullScreen
      />
    </Grid>
  );
}
