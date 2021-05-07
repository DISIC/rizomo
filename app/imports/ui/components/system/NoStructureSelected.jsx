import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

const useStyle = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
    marginTop: 30,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    outline: 'none',
    marginRight: 25,
    fontFamily: 'WorkSansBold',
  },
}));

const NoStructureSelected = () => {
  const classes = useStyle();
  return (
    <>
      <Typography className={classes.title} variant="h5" color="inherit">
        {i18n.__('components.NoStructureSelected.noStructure')}
      </Typography>
      <Link className={classes.link} to="/profile">
        <Typography className={classes.paragraph} paragraph color="inherit">
          {i18n.__('components.NoStructureSelected.selectStructure')}
        </Typography>
      </Link>
    </>
  );
};

export default NoStructureSelected;
