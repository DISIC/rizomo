import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {},
  toast: {},
  body: {},
  progress: {
    background: '#bb86fc',
  },
}));

const CustomToast = () => {
  const classes = useStyles();

  return (
    <ToastContainer
      type={toast.TYPE.INFO}
      limit={5}
      newestOnTop={false}
      className={classes.root}
      toastclassName={classes.toast}
      bodyClassName={classes.body}
      progressClassName={classes.progress}
    />
  );
};

export default CustomToast;
