import { Meteor } from "meteor/meteor";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Roles } from "meteor/alanning:roles";
import i18n from "meteor/universe:i18n";

import { Groups } from "../group/Group";

export const setAdminOf = new ValidatedMethod({
  name: "user.setAdminOf",
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group == undefined) {
      throw new Meteor.Error(
        "api.user.setAdminOf.unknownGroup",
        i18n.__("api.user.unknownGroup")
      );
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user == undefined) {
      throw new Meteor.Error(
        "api.user.setAdminOf.unknownUser",
        i18n.__("api.user.unknownUser")
      );
    }
    // check if current user has admin rights on group (or global admin)
    authorized =
      (this.userId && Roles.userIsInRole(this.userId, "admin", groupId)) ||
      this.userId === group.owner;
    if (!authorized) {
      throw new Meteor.Error(
        "api.user.setAdminOf.notPermitted",
        i18n.__("api.user.adminGroupNeeded")
      );
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, "admin", groupId);
    // store info in group collection
    if (group.admins.indexOf(userId) === -1) {
      Groups.update(groupId, { $push: { admins: userId } });
    }
  }
});

export const setMemberOf = new ValidatedMethod({
  name: "user.setMemberOf",
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group == undefined) {
      throw new Meteor.Error(
        "api.user.setMemberOf.unknownGroup",
        i18n.__("api.user.unknownGroup")
      );
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user == undefined) {
      throw new Meteor.Error(
        "api.user.setMemberOf.unknownUser",
        i18n.__("api.user.unknownUser")
      );
    }
    // check if current user has admin rights on group (or global admin)
    authorized =
      (this.userId && Roles.userIsInRole(this.userId, "admin", groupId)) ||
      this.userId === group.owner;
    if (!authorized) {
      throw new Meteor.Error(
        "api.user.setMemberOf.notPermitted",
        i18n.__("api.user.adminGroupNeeded")
      );
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, "member", groupId);
    // remove candidate Role if present
    if (Roles.userIsInRole(userId, "candidate", groupId)) {
      Roles.removeUsersFromRoles(userId, "candidate", groupId);
    }
    // store info in group collection
    if (group.members.indexOf(userId) === -1) {
      Groups.update(groupId, {
        $push: { members: userId },
        $pull: { candidates: userId }
      });
    }
  }
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([setAdminOf, setMemberOf], "name");

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      }
    },
    5,
    1000
  );
}
