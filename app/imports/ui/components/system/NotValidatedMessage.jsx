import React from 'react';
import i18n from 'meteor/universe:i18n';
import { Typography, makeStyles } from '@material-ui/core';

const useStyle = makeStyles(() => ({
  title: {
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
    marginTop: 30,
  },
}));

const NotValidatedMessage = () => {
  const classes = useStyle();
  return (
    <>
      <Typography className={classes.title} variant="h5" color="inherit">
        {i18n.__('components.NotValidatedMessage.inactiveAccount')}
      </Typography>
      <Typography className={classes.paragraph} paragraph color="inherit">
        {i18n.__('components.NotValidatedMessage.waitAccount')}
      </Typography>
    </>
  );
};

export default NotValidatedMessage;
