import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { Tracker } from "meteor/tracker";

const AppRoles = ["candidate", "member", "admin"];

Meteor.users.schema = new SimpleSchema(
  {
    username: {
      type: String,
      // For accounts-password, either emails or username is required, but not both. It is OK to make this
      // optional here because the accounts-password package does its own validation.
      // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
      optional: true
    },
    emails: {
      type: Array,
      // For accounts-password, either emails or username is required, but not both. It is OK to make this
      // optional here because the accounts-password package does its own validation.
      // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
      optional: true
    },
    "emails.$": {
      type: Object
    },
    "emails.$.address": {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
      type: Boolean
    },
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field / splendido:meteor-accounts-meld
    // registered_emails: {
    //     type: Array,
    //     optional: true
    // },
    // 'registered_emails.$': {
    //     type: Object,
    //     blackbox: true
    // },
    createdAt: {
      type: Date
    },
    profile: {
      type: Object,
      optional: true,
      blackbox: true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
      type: Object,
      optional: true,
      blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
      type: Object,
      optional: true,
      blackbox: true
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
      type: Date,
      optional: true
    },
    isActive: { type: Boolean, defaultValue: false },
    isRequest: { type: Boolean, defaultValue: true }
  },
  { tracker: Tracker }
);

Meteor.users.helpers({
  memberOf() {
    return Roles.getScopesForUser(this, "member");
  },
  adminOf() {
    return Roles.getScopesForUser(this, "admin");
  },
  candidateOf() {
    return Roles.getScopesForUser(this, "candidate");
  }
});

Meteor.users.publicFields = {
  username: 1,
  emails: 1,
  createdAt: 1,
  roles: 1,
  isActive: 1,
  isRequest: 1
};

Meteor.users.attachSchema(Meteor.users.schema);

export { AppRoles };
