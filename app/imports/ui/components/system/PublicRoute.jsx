import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * PublicRoute (see React Router v4 sample)
 * Routes to the requested page if not logged in, otherwise goes to Homepage.
 * @param {any} { component: Component, ...rest }
 */
const PublicRoute = ({ component: Component, authenticated, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (!authenticated) {
        return <Component {...props} />;
      }
      return <Redirect to={{ pathname: '/', state: { from: props.location } }} />;
    }}
  />
);

PublicRoute.defaultProps = {
  location: {},
};

PublicRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  authenticated: PropTypes.bool.isRequired,
  location: PropTypes.objectOf(PropTypes.any),
};

export default PublicRoute;
