import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = (color) =>
  makeStyles((theme) => ({
    button: {
      color: theme.palette.tertiary.main,
      backgroundColor: color,
      textTransform: 'none',
      '&:hover': {
        backgroundColor: theme.palette.tertiary.main,
        color,
      },
    },
  }));

const ValidationButton = ({ onAction, text, disabled, icon, onCancel, color }) => {
  const [timesPressed, setTimePressed] = useState(0);
  const [timer, setTimer] = useState(-1);
  const classes = useStyles(color)();

  const onPress = () => {
    setTimePressed(timesPressed + 1);
    setTimer(3);
  };

  const startInterval = (pressed, timerValue = 3) => {
    setTimeout(() => {
      if (pressed === timesPressed && timerValue !== 0) {
        setTimer(timerValue - 1);
      } else if (timerValue === 0) {
        setTimePressed(0);
        setTimer(-1);
        if (onCancel) {
          onCancel();
        }
      }
    }, 1000);
  };

  useEffect(() => {
    if (timesPressed === 2) {
      onAction();
      setTimePressed(0);
      setTimer(-1);
    } else if (timesPressed !== 0 && timer !== -1) {
      startInterval(timesPressed, timer);
    } else {
      setTimePressed(0);
      setTimer(-1);
    }
  }, [timesPressed, timer]);

  return (
    <Button
      startIcon={timer === -1 ? icon : `${timer} | `}
      className={classes.button}
      size="large"
      variant="contained"
      onClick={onPress}
      disabled={disabled}
    >
      {timer === -1 ? text : i18n.__('components.ValidationButton.sure')}
    </Button>
  );
};

ValidationButton.defaultProps = {
  color: 'primary',
  disabled: false,
  onCancel: null,
  icon: null,
};

ValidationButton.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string.isRequired,
  icon: PropTypes.objectOf(PropTypes.any),
  onAction: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  disabled: PropTypes.bool,
};

export default ValidationButton;
