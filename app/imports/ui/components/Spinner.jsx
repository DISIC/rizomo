import React from 'react';
import { CircularProgress } from '@material-ui/core';

const divStyle = {
  width: '100%',
  textAlign: 'center',
  marginTop: 50,
};

export default Spinner = () => (
  <div style={divStyle}>
    <CircularProgress />
  </div>
);
