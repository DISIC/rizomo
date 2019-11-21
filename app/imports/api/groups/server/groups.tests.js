/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Factory } from "meteor/dburles:factory";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { chai, assert } from "meteor/practicalmeteor:chai";
import { Random } from "meteor/random";
import faker from "faker";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import "/i18n/en.i18n.json";

import { Groups } from "../groups.js";
import { createGroup, removeGroup } from "../methods.js";
import "./publications.js";

// this file also includes tests on users/permissions
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import {
  setAdminOf,
  unsetAdminOf,
  setMemberOf,
  unsetMemberOf
} from "../../users/methods";

describe("groups", function() {
  describe("mutators", function() {
    it("builds correctly from factory", function() {
      const group = Factory.create("group", { owner: Random.id() });
      assert.typeOf(group, "object");
      assert.equal(group.active, true);
    });
  });
  describe("publications", function() {
    before(function() {
      Groups.remove({});
      _.times(4, () => Factory.create("group", { owner: Random.id() }));
    });
    describe("groups.all", function() {
      it("sends all groups", function(done) {
        const collector = new PublicationCollector();
        collector.collect("groups.all", collections => {
          chai.assert.equal(collections.groups.length, 4);
          done();
        });
      });
    });
  });
  describe("methods", function() {
    let groupId;
    let group2Id;
    let group3Id;
    let userId;
    let adminId;
    let otherUserId;
    beforeEach(function() {
      // Clear
      Groups.remove({});
      Meteor.users.remove({});
      // FIXME : find a way to reset roles collection ?
      Roles.createRole("admin", { unlessExists: true });
      Roles.createRole("member", { unlessExists: true });
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: "toto"
      });
      const emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: "toto"
      });
      const emailOtherUser = faker.internet.email();
      otherUserId = Accounts.createUser({
        email: emailOtherUser,
        username: emailOtherUser,
        password: "toto"
      });
      // set this user as global admin
      Roles.addUsersToRoles(adminId, "admin");
      // Create a group owned by userId
      groupId = Factory.create("group", { owner: userId })._id;
      // Create a group owned by random user and set userId as admin
      group2Id = Factory.create("group", { owner: Random.id() })._id;
      setAdminOf._execute({ userId: adminId }, { userId, groupId: group2Id });
      group3Id = Factory.create("group", { owner: Random.id() })._id;
    });
    describe("(un)setAdminOf", function() {
      it("global admin can set/unset a user as admin of a group", function() {
        setAdminOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, "admin", group3Id), true);
        assert.include(
          group.admins,
          userId,
          "group admins list contains userId"
        );
        unsetAdminOf._execute(
          { userId: adminId },
          { userId, groupId: group3Id }
        );
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, "admin", group3Id), false);
        assert.notInclude(
          group.admins,
          userId,
          "group admins list shouldn't contain userId"
        );
      });
      it("group admin can set/unset a user as admin of a group", function() {
        setAdminOf._execute(
          { userId },
          { userId: otherUserId, groupId: group2Id }
        );
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, "admin", group2Id), true);
        assert.include(
          group.admins,
          otherUserId,
          "group admins list contains otherUserId"
        );
        unsetAdminOf._execute(
          { userId },
          { userId: otherUserId, groupId: group2Id }
        );
        group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, "admin", group2Id), false);
        assert.notInclude(
          group.admins,
          otherUserId,
          "group admins list shouldn't contain otherUserId"
        );
      });
      it("only global or group admin/owner can set/unset a user as admin of a group", function() {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            setAdminOf._execute(
              { userId: otherUserId },
              { userId, groupId: groupId }
            );
          },
          Meteor.Error,
          /api.users.setAdminOf.notPermitted/
        );
        assert.throws(
          () => {
            unsetAdminOf._execute(
              { userId: otherUserId },
              { userId, groupId: groupId }
            );
          },
          Meteor.Error,
          /api.users.unsetAdminOf.notPermitted/
        );
      });
    });
    describe("setMemberOf", function() {
      it("global admin can set/unset a user as member of a group", function() {
        setMemberOf._execute(
          { userId: adminId },
          { userId, groupId: group3Id }
        );
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, "member", group3Id), true);
        assert.include(
          group.members,
          userId,
          "group members list contains userId"
        );
        unsetMemberOf._execute(
          { userId: adminId },
          { userId, groupId: group3Id }
        );
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, "member", group3Id), false);
        assert.notInclude(
          group.members,
          userId,
          "group members list shouldn't contain userId"
        );
      });
      it("group admin can set/unset a user as member of a group", function() {
        setMemberOf._execute(
          { userId },
          { userId: otherUserId, groupId: group2Id }
        );
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, "member", group2Id), true);
        assert.include(
          group.members,
          otherUserId,
          "group members list contains otherUserId"
        );
        unsetMemberOf._execute(
          { userId },
          { userId: otherUserId, groupId: group2Id }
        );
        group = Groups.findOne(group2Id);
        assert.equal(
          Roles.userIsInRole(otherUserId, "member", group2Id),
          false
        );
        assert.notInclude(
          group.members,
          otherUserId,
          "group members list shouldn't contain otherUserId"
        );
      });
      it("only global or group admin can set/unset a user as member of a group", function() {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            setMemberOf._execute(
              { userId: otherUserId },
              { userId, groupId: groupId }
            );
          },
          Meteor.Error,
          /api.users.setMemberOf.notPermitted/
        );
        assert.throws(
          () => {
            unsetMemberOf._execute(
              { userId: otherUserId },
              { userId, groupId: groupId }
            );
          },
          Meteor.Error,
          /api.users.unsetMemberOf.notPermitted/
        );
      });
    });
    describe("createGroup", function() {
      it("does create a group and set current user as owner", function() {
        createGroup._execute(
          { userId },
          { name: "mongroupe", type: 0, info: "une info", note: "une note" }
        );
        const group = Groups.findOne({ name: "mongroupe" });
        assert.typeOf(group, "object");
        assert.equal(group.active, true);
        assert.equal(group.owner, userId);
      });
    });
    describe("removeGroup", function() {
      it("does not delete a group you don't own or are admin of", function() {
        // Throws if non owner/admin user, or logged out user, tries to delete the group
        assert.throws(
          () => {
            removeGroup._execute({ userId: userId }, { groupId: group3Id });
          },
          Meteor.Error,
          /api.groups.removeGroup.notPermitted/
        );
        assert.throws(
          () => {
            removeGroup._execute({}, { groupId });
          },
          Meteor.Error,
          /api.groups.removeGroup.notPermitted/
        );
      });
      it("does delete a group you own", function() {
        removeGroup._execute({ userId }, { groupId });
        assert.equal(Groups.findOne(groupId), undefined);
      });
      it("does delete a group you are admin of", function() {
        removeGroup._execute({ userId }, { groupId: group2Id });
        assert.equal(Groups.findOne(group2Id), undefined);
      });
      it("does delete any group when you are global admin", function() {
        removeGroup._execute({ userId: adminId }, { groupId: group3Id });
        assert.equal(Groups.findOne(group3Id), undefined);
      });
    });
  });
});
