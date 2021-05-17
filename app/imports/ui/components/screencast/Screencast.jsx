import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

export default function Screencast() {
  const useStyles = makeStyles({
    iframe: {
      display: 'grid',
      justifyContent: 'center',
      padding: '20px',
      width: '55vw',
      height: '55vh',
    },
  });
  const classes = useStyles();

  return (
    <Grid className={classes.iframe}>
      <iframe
        title="screencast_frame"
        sandbox="allow-same-origin allow-scripts allow-popups"
        src="https://tube-dijon.beta.education.fr/videos/embed/d72319ee-1f67-41ac-aa4d-ece4f8ad1478"
        frameBorder="0"
        allowFullScreen
      />
    </Grid>
  );
}
