import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { checkDomain } from '../utils';

const AppRoles = ['candidate', 'member', 'animator', 'admin'];

Meteor.users.schema = new SimpleSchema(
  {
    username: {
      type: String,
      optional: true,
    },
    firstName: {
      type: String,
      optional: true,
    },
    lastName: {
      type: String,
      optional: true,
    },
    emails: {
      type: Array,
      optional: true,
    },
    'emails.$': {
      type: Object,
    },
    'emails.$.address': {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
    'emails.$.verified': {
      type: Boolean,
    },
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field
    // splendido:meteor-accounts-meld
    // registered_emails: {
    //     type: Array,
    //     optional: true
    // },
    // 'registered_emails.$': {
    //     type: Object,
    //     blackbox: true
    // },
    createdAt: {
      type: Date,
    },
    profile: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
      type: Date,
      optional: true,
    },
    isActive: { type: Boolean, defaultValue: false },
    isRequest: { type: Boolean, defaultValue: true },
    favServices: {
      type: Array,
      defaultValue: [],
    },
    'favServices.$': {
      type: { type: String, regEx: SimpleSchema.RegEx.Id },
    },
    structure: {
      type: String,
      optional: true,
    },
    primaryEmail: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
      optional: true,
    },
    language: {
      type: String,
      optional: true,
    },
  },
  { tracker: Tracker },
);

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    // pass the structure name in the options
    const newUser = { ...user };
    if (options.firstName) newUser.firstName = options.firstName;
    if (options.lastName) newUser.lastName = options.lastName;
    if (options.structure) newUser.structure = options.structure;
    if (options.profile) newUser.profile = options.profile;
    return newUser;
  });
  if (Meteor.settings.public.enableKeycloak === true) {
    // server side login hook
    Accounts.onLogin((details) => {
      if (details.type === 'keycloak') {
        // update user informations from keycloak service data
        const updateInfos = {
          primaryEmail: details.user.services.keycloak.email,
        };
        if (details.user.services.keycloak.given_name) {
          updateInfos.firstName = details.user.services.keycloak.given_name;
        }
        if (details.user.services.keycloak.family_name) {
          updateInfos.lastName = details.user.services.keycloak.family_name;
        }
        if (
          details.user.username === undefined
          || (details.user.username === details.user.primaryEmail
            && details.user.primaryEmail !== details.user.services.keycloak.email)
        ) {
          // use email as username if no username yet or if username was
          // email and email has changed on Keycloak
          updateInfos.username = details.user.services.keycloak.email;
        }
        if (details.user.isActive === false) {
          // auto activate user based on email address
          if (checkDomain(details.user.services.keycloak.email)) {
            updateInfos.isActive = true;
            updateInfos.isRequest = false;
          } else {
            // user email not whitelisted, request activation by admin
            updateInfos.isRequest = true;
          }
        }
        Meteor.users.update({ _id: details.user._id }, { $set: updateInfos });
        // Manage primary email change
        if (details.user.primaryEmail !== details.user.services.keycloak.email) {
          Accounts.addEmail(details.user._id, details.user.services.keycloak.email, true);
          if (details.user.primaryEmail !== undefined) {
            Accounts.removeEmail(details.user._id, details.user.primaryEmail);
          }
        }
        // check if user is defined as admin in settings
        if (Meteor.settings.keycloak.adminEmails.indexOf(details.user.services.keycloak.email) !== -1) {
          if (!Roles.userIsInRole(details.user._id, 'admin')) {
            Roles.addUsersToRoles(details.user._id, 'admin');
            console.log(i18n.__('api.users.adminGiven'), details.user.services.keycloak.email);
          }
        }
      }
    });
  }
}

Meteor.users.helpers({
  memberOf() {
    return Roles.getScopesForUser(this, 'member');
  },
  adminOf() {
    return Roles.getScopesForUser(this, 'admin');
  },
  candidateOf() {
    return Roles.getScopesForUser(this, 'candidate');
  },
});

Meteor.users.selfFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  emails: 1,
  createdAt: 1,
  isActive: 1,
  isRequest: 1,
  favServices: 1,
  structure: 1,
  primaryEmail: 1,
  language: 1,
};

Meteor.users.adminFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  emails: 1,
  createdAt: 1,
  isActive: 1,
  isRequest: 1,
  structure: 1,
};

Meteor.users.publicFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  isActive: 1,
  isRequest: 1,
  structure: 1,
};

Meteor.users.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

Meteor.users.attachSchema(Meteor.users.schema);

export default AppRoles;
