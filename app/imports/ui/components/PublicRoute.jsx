import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * PublicRoute (see React Router v4 sample)
 * Routes to the requested page if not logged in, otherwise goes to Homepage.
 * @param {any} { component: Component, ...rest }
 */
const PublicRoute = ({
  component: Component, authenticated, loggingIn, ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      if (loggingIn) return <span>Logging in ...</span>;
      return !authenticated ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: '/', state: { from: props.location } }} />
      );
    }}
  />
);

PublicRoute.defaultProps = {
  loggingIn: false,
  location: {},
};

PublicRoute.propTypes = {
  loggingIn: PropTypes.bool,
  component: PropTypes.func.isRequired,
  authenticated: PropTypes.bool.isRequired,
  location: PropTypes.objectOf(PropTypes.any),
};

export default PublicRoute;
