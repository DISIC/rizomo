import React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import i18n from 'meteor/universe:i18n';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  skipLink: {
    zIndex: 10000,
    background: theme.palette.primary.main,
    color: theme.palette.tertiary.main,
    fontWeight: 500,
    height: 48,
    left: '50%',
    borderRadius: theme.shape.borderRadius,
    padding: 8,
    position: 'absolute',
    transform: 'translateY(-100%)',
    transition: 'transform 0.3s',

    '&:focus': {
      transform: 'translateY(0%)',
    },
  },
}));

const SkipLink = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <a className={classes.skipLink} href="#main" onClick={() => history.replace('#main')}>
      <Typography variant="h6">{i18n.__(`components.SkipLink.skipToContent`)}</Typography>
    </a>
  );
};

export default SkipLink;
