import React from 'react';
import UserContext from './UserContext';

export default function withUser(Comp) {
  return function WrapperComponent(props) {
    const { user, loading } = React.useContext(UserContext);
    return loading ? (
      <Comp {...props} currentUser={{}} userIsLoading={loading} />
    ) : (
      <Comp {...props} currentUser={user} userIsLoading={loading} />
    );
  };
}
