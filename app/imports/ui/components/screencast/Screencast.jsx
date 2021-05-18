import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../contexts/context';

export default function Screencast(link) {
  const [{ isMobile }] = useAppContext();
  const url = link;
  console.log(url === 'https://tube-dijon.beta.education.fr/videos/embed/d72319ee-1f67-41ac-aa4d-ece4f8ad1478');

  const useStyles = makeStyles({
    grid: {
      display: 'grid',
      justifyContent: 'center',
      padding: '20px',
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
        src={url}
        frameBorder="0"
        allowFullScreen
      />
    </Grid>
  );
}
