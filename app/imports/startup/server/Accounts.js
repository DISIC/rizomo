import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { ServiceConfiguration } from 'meteor/service-configuration';

// required: loads accounts customization before initial users creation
import AppRoles from '../../api/users/users';

if (Meteor.settings.keycloak) {
  ServiceConfiguration.configurations.upsert(
    { service: 'keycloak' },
    {
      $set: {
        loginStyle: 'redirect',
        serverUrl: Meteor.settings.keycloak.url,
        realm: Meteor.settings.keycloak.realm,
        clientId: Meteor.settings.keycloak.client,
        realmPublicKey: Meteor.settings.keycloak.pubkey,
        bearerOnly: false,
      },
    },
  );
} else {
  console.log('No Keycloak configuration. Please invoke meteor with a settings file.');
}

/* eslint-disable no-console */

function createUser(email, password, role, structure, firstName, lastName) {
  console.log(`  Creating user ${email}.`);
  const userID = Accounts.createUser({
    username: email,
    email,
    password,
    structure,
    firstName,
    lastName,
  });
  // global admin
  if (role === 'admin') {
    Roles.addUsersToRoles(userID, 'admin', null);
  }
  // default accounts are created as active
  Meteor.users.update(userID, { $set: { isActive: true } });
}

/* ensure all roles exist */
const existingRoles = Roles.getAllRoles()
  .fetch()
  .map((role) => role._id);
AppRoles.forEach((role) => {
  if (existingRoles.indexOf(role) === -1) Roles.createRole(role);
});

/** When running app for first time, pass a settings file to set up a default user account. */
if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.defaultAccounts) {
    console.log('Creating the default user(s)');
    Meteor.settings.defaultAccounts.map(({
      email, password, role, structure, firstName, lastName,
    }) => createUser(email, password, role, structure, firstName, lastName));
  } else {
    console.log('No default users to create !  Please invoke meteor with a settings file.');
  }
}
