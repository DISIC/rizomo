import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
