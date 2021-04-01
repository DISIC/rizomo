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
const StructureAdminRoute = ({ component: Component, user, loadingUser, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (loadingUser) {
        return <Spinner full />;
      }
      if (Roles.userIsInRole(user._id, 'adminStructure', user.structure) || Roles.userIsInRole(user._id, 'admin')) {
        return <Component {...props} />;
      }
      return <Redirect to={{ pathname: '/', state: { from: props.location } }} />;
    }}
  />
);

StructureAdminRoute.defaultProps = {
  location: {},
};

StructureAdminRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.objectOf(PropTypes.any),
  loadingUser: PropTypes.bool.isRequired,
};

export default StructureAdminRoute;
