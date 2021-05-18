import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { useAppContext } from '../../contexts/context';

export default function Screencast({ link }) {
  const [{ isMobile }] = useAppContext();

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
        src={link}
        frameBorder="0"
        allowFullScreen
      />
    </Grid>
  );
}

Screencast.propTypes = {
  link: PropTypes.string.isRequired,
};
