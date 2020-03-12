import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Roles } from 'meteor/alanning:roles';
import Spinner from './Spinner';

/**
 * AdminRoute (see React Router v4 sample)
 * Checks for Meteor login before routing to the requested page, otherwise goes to signin page.
 * @param {any} { component: Component, ...rest }
 */
const AdminRoute = ({
  component: Component, userId, loadingUser, ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      if (loadingUser) {
        return <Spinner full />;
      }
      if (Roles.userIsInRole(userId, 'admin')) {
        return <Component {...props} />;
      }
      return <Redirect to={{ pathname: '/', state: { from: props.location } }} />;
    }}
  />
);

AdminRoute.defaultProps = {
  location: {},
};

AdminRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  userId: PropTypes.string.isRequired,
  location: PropTypes.objectOf(PropTypes.any),
  loadingUser: PropTypes.bool.isRequired,
};

export default AdminRoute;
