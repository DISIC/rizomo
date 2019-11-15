import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";

// required: loads accounts customization before initial users creation
import { AppRoles } from "../../api/user/User.js";

/* eslint-disable no-console */

function createUser(email, password, role) {
  console.log(`  Creating user ${email}.`);
  const userID = Accounts.createUser({
    username: email,
    email: email,
    password: password
  });
  // global admin
  if (role === "admin") {
    Roles.addUsersToRoles(userID, "admin", null);
  }
}

/* ensure all roles exist */
const existingRoles = Roles.getAllRoles()
  .fetch()
  .map(role => role._id);
AppRoles.forEach(role => {
  if (existingRoles.indexOf(role) === -1) Roles.createRole(role);
});

/** When running app for first time, pass a settings file to set up a default user account. */
if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.defaultAccounts) {
    console.log("Creating the default user(s)");
    Meteor.settings.defaultAccounts.map(({ email, password, role }) =>
      createUser(email, password, role)
    );
  } else {
    console.log(
      "No default users to create !  Please invoke meteor with a settings file."
    );
  }
}
