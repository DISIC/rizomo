import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import Spinner from './Spinner';

/**
 * ProtectedRoute (see React Router v4 sample)
 * Checks for Meteor login before routing to the requested page, otherwise goes to signin page.
 * @param {any} { component: Component, ...rest }
 */
const ProtectedRoute = ({ component: Component, authenticated, loggingIn, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (loggingIn) {
        return <Spinner full />;
      }
      if (authenticated) {
        return <Component {...props} />;
      }
      return <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />;
    }}
  />
);

ProtectedRoute.defaultProps = {
  location: {},
};

ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  authenticated: PropTypes.bool.isRequired,
  loggingIn: PropTypes.bool.isRequired,
  location: PropTypes.objectOf(PropTypes.any),
};

export default ProtectedRoute;
