import React from 'react';
import Grid from '@material-ui/core/Grid';

export default function Screencast() {
  return (
    <Grid>
      <iframe
        title="screencast_frame"
        width="860"
        height="483"
        sandbox="allow-same-origin allow-scripts allow-popups"
        src="https://tube-dijon.beta.education.fr/videos/embed/4d5f4b53-cdb0-41af-ac56-0e779a5d309f"
        frameBorder="0"
      />
    </Grid>
  );
}
