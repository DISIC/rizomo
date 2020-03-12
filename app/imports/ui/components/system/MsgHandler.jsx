import React, { useState, useEffect } from 'react';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

const defaultOptions = {
  duration: 4000, // time before autohide
  hideOnClick: false, // if true, alert doesn't autohide
};

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const MsgHandler = () => {
  const [options, setOptions] = useState(defaultOptions);
  const [openError, setOpenError] = useState(false);
  useEffect(() => {
    setOpenError(!!options.message);
  }, [options]);

  global.msg = {
    success: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: newMessage,
        severity: 'success',
      });
    },
    error: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: newMessage,
        severity: 'error',
      });
    },
    warning: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: newMessage,
        severity: 'warning',
      });
    },
    info: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: newMessage,
        severity: 'info',
      });
    },
  };

  const handleMsgClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOptions(defaultOptions);
  };
  if (!openError) {
    return null;
  }
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={openError}
      autoHideDuration={options.hideOnClick ? null : options.duration}
      onClose={handleMsgClose}
    >
      <Alert onClose={handleMsgClose} severity={options.severity}>
        {options.message}
      </Alert>
    </Snackbar>
  );
};

export default MsgHandler;
