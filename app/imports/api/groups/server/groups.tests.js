/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Factory } from "meteor/dburles:factory";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { chai, assert } from "meteor/practicalmeteor:chai";
import { Random } from "meteor/random";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import { Groups } from "../groups.js";
import { createGroup, removeGroup } from "../methods.js";
import "/i18n/en.i18n.json";
import "./publications.js";

describe("groups", function() {
  describe("mutators", function() {
    it("builds correctly from factory", function() {
      const group = Factory.create("group", { owner: Random.id() });
      assert.typeOf(group, "object");
      assert.equal(group.active, true);
    });
  });
  describe("publications", function() {
    const userId = Random.id();
    before(function() {
      Groups.remove({});
      _.times(2, () => Factory.create("group", { owner: userId }));
      _.times(2, () => Factory.create("group", { owner: Random.id() }));
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
    let userId;
    beforeEach(function() {
      // Clear
      Groups.remove({});
      // Generate a 'user'
      userId = Random.id();
      adminId = Random.id();
      // Create a group owned by userId
      groupId = Factory.create("group", { owner: userId })._id;
      // Create a group owned by randim user and set adminId as admin
      groupAdminId = Factory.create("group", { owner: Random.id() })._id;
      Groups.update(groupAdminId, { $push: { admins: adminId } });
    });
    describe("createGroup", function() {
      it("does create a group and set current user as owner", function() {
        // Throws if non owner/admin user, or logged out user, tries to delete the group
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
            removeGroup._execute({ userId: adminId }, { groupId });
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
    });
  });
});
