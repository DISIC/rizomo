import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import SignLayout from './SignLayout';
import MainLayout from './MainLayout';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import UserContext from '../contexts/UserContext';

function App(props) {
  const {
    user, loading, roles, authenticated,
  } = props;
  return (
    <BrowserRouter>
      <div>
        <UserContext.Provider
          value={{
            user,
            loading,
            roles,
            authenticated,
          }}
        >
          <Switch>
            <PublicRoute path="/signin" component={SignLayout} {...props} />
            <Route path="/signup" component={SignLayout} {...props} />
            <ProtectedRoute exact path="/" component={MainLayout} {...props} />
            <Route component={NotFound} />
          </Switch>
        </UserContext.Provider>
      </div>
    </BrowserRouter>
  );
}

App.propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  loading: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string),
  authenticated: PropTypes.bool,
};

App.defaultProps = {
  user: { _id: null, username: '', favServices: [] },
  loading: true,
  authenticated: false,
  roles: [],
};

export default withTracker(() => {
  const userHandle = Meteor.subscribe('userData');
  const loading = !userHandle.ready() && !Roles.subscription.ready();
  const loggingIn = Meteor.loggingIn();
  const user = Meteor.user();
  const userId = Meteor.userId();

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    user,
    roles: Roles.getRolesForUser(userId),
  };
})(App);
