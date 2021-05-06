import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

export default function Screencast() {
  const useStyles = makeStyles({
    iframe: {
      display: 'grid',
      justifyContent: 'center',
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
        src="https://tube-dijon.beta.education.fr/videos/embed/4d5f4b53-cdb0-41af-ac56-0e779a5d309f"
        frameBorder="0"
      />
    </Grid>
  );
}
