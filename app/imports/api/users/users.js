import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Roles } from 'meteor/alanning:roles';

const AppRoles = ['candidate', 'member', 'admin'];

Meteor.users.schema = new SimpleSchema(
  {
    username: {
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
  },
  { tracker: Tracker },
);

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
  emails: 1,
  createdAt: 1,
  roles: 1,
  isActive: 1,
  isRequest: 1,
};

Meteor.users.publicFields = {
  username: 1,
  isActive: 1,
  isRequest: 1,
};

Meteor.users.attachSchema(Meteor.users.schema);

export default AppRoles;
