import React from 'react'
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';

import UserContext from '../contexts/UserContext';

export default function UserProfile() {
    return (
        <>
            <UserContext.Consumer>
                {({ user, loading }) => {
                    if (!loading) {
                        console.log('user', user)
                        return user.username;
                    }
                    return 'rien';
                }}                
            </UserContext.Consumer>
        </>
    )
}
