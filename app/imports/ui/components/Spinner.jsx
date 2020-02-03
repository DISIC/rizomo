import React from 'react';
import { CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';

const divStyle = {
  width: '100%',
  textAlign: 'center',
  marginTop: 50,
};

const divStyleFull = {
  position: 'absolute',
  backgroundColor: 'rgba(255,255,255,0.7)',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 5,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const Spinner = ({ full = false }) => (
  <div style={full ? divStyleFull : divStyle}>
    <CircularProgress />
  </div>
);

export default Spinner;

Spinner.defaultProps = {
  full: false,
};

Spinner.propTypes = {
  full: PropTypes.bool,
};
