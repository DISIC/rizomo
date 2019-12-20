import React from 'react';
import { CircularProgress } from '@material-ui/core';

const divStyle = {
  width: '100%',
  textAlign: 'center',
  marginTop: 50,
};

const Spinner = () => (
  <div style={divStyle}>
    <CircularProgress />
  </div>
);

export default Spinner;
