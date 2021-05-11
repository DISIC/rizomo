import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

export default function ScreencastMezig() {
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
        src="https://tube-dijon.beta.education.fr/videos/embed/d024f709-8b65-4f69-b058-22569f2b881d"
        frameBorder="0"
        allowFullScreen
      />
    </Grid>
  );
}
