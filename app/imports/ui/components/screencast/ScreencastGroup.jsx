import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

export default function ScreencastGroup() {
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
        title="screencast_frame"
        sandbox="allow-same-origin allow-scripts allow-popups"
        src="https://tube-dijon.beta.education.fr/videos/embed/57752b90-5b36-4b3f-9b83-1b7464e41a5f"
        frameBorder="0"
      />
    </Grid>
  );
}
