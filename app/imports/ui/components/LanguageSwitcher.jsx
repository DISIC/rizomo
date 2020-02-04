import React, { useContext } from 'react';
import i18n from 'meteor/universe:i18n';
import {
  makeStyles, Menu, Button, MenuItem, IconButton,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { Context } from '../contexts/context';

const LanguageSwitcher = ({ topbar }) => {
  const allLanguages = i18n.getLanguages();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [{ language }, dispatch] = useContext(Context);
  const T = i18n.createComponent('languages');

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const switchLanguage = (lan) => {
    i18n.setLocale(lan);
    handleClose();
    dispatch({ type: 'language', data: { language: lan } });
  };

  const useStyles = makeStyles(() => ({
    switcher: {
      color: 'red',
      position: topbar ? null : 'absolute',
      right: topbar ? null : 60,
      bottom: topbar ? null : 30,
    },
    flag: {
      height: 15,
    },
  }));
  const classes = useStyles();
  const flag = (
    <img
      alt={`flag for ${i18n.getLanguageNativeName(language)}`}
      className={classes.flag}
      src={`images/i18n/${language}.png`}
    />
  );
  return (
    <div className={classes.switcher}>
      {topbar ? (
        <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          {flag}
        </IconButton>
      ) : (
        <Button
          startIcon={flag}
          variant="contained"
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <T>{language}</T>
        </Button>
      )}
      <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {allLanguages.map((lan) => (
          <MenuItem key={lan} onClick={() => switchLanguage(lan)}>
            <T>{lan}</T>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;

LanguageSwitcher.defaultProps = {
  topbar: false, // trigger if the switcher is in the topbar or not
};

LanguageSwitcher.propTypes = {
  topbar: PropTypes.bool,
};
