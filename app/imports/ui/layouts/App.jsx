import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  BrowserRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import SignLayout from './SignLayout';
import MainLayout from './MainLayout';
import NotFound from '../pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route path="/signin" component={SignLayout} />
          <Route path="/signup" component={SignLayout} />
          <ProtectedRoute exact path="/" component={MainLayout} />
          <ProtectedRoute exact path="/profile" component={MainLayout} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

/**
 * ProtectedRoute (see React Router v4 sample)
 * Checks for Meteor login before routing to the requested page, otherwise goes to signin page.
 * @param {any} { component: Component, ...rest }
 */
const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      const isLogged = Meteor.userId() !== null;
      return isLogged ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />
      );
    }}
  />
);

ProtectedRoute.propTypes = {
  component: PropTypes.element.isRequired,
  location: PropTypes.objectOf(PropTypes.any).isRequired,
};
