import React from 'react';
import UserContext from './UserContext';

export default function withUser(Comp) {
  return function WrapperComponent(props) {
    const { user } = React.useContext(UserContext);
    return <Comp {...props} currentUser={user} />;
  };
}
