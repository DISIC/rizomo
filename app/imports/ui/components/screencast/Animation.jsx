import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

export default function Animation() {
  const useStyles = makeStyles({
    iframe: {
      display: 'grid',
      justifyContent: 'center',
      padding: '20px',
    },
  });
  const classes = useStyles();

  return (
    <Grid className={classes.iframe}>
      <iframe
        width="840"
        height="473"
        title="screencast_frame"
        sandbox="allow-same-origin allow-scripts allow-popups"
        src="https://tube-dijon.beta.education.fr/videos/embed/940b6b1f-09b6-4995-a86a-a1901cd8ae21"
        allowFullScreen
      />
    </Grid>
  );
}
