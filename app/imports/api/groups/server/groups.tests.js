/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import faker from 'faker';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';

// this file also includes tests on users/permissions
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import Groups from '../groups';
import {
  createGroup, removeGroup, updateGroup, findGroups,
} from '../methods';
import './publications';
import {
  setAdminOf,
  unsetAdminOf,
  setMemberOf,
  unsetMemberOf,
  setCandidateOf,
  unsetCandidateOf,
  setAnimatorOf,
  unsetAnimatorOf,
} from '../../users/server/methods';

describe('groups', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const group = Factory.create('group', { owner: Random.id() });
      assert.typeOf(group, 'object');
      assert.equal(group.active, true);
    });
  });
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      Groups.remove({});
      _.times(3, () => Factory.create('group', { owner: Random.id() }));
      Factory.create('group', { owner: Random.id(), name: 'MonGroupe' });
    });
    describe('groups.all', function () {
      it('sends all groups', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('groups.all', {}, (collections) => {
          chai.assert.equal(collections.groups.length, 4);
          done();
        });
      });
    });
    describe('groups.one', function () {
      it('sends all groups', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('groups.one', { slug: 'mongroupe' }, (collections) => {
          chai.assert.equal(collections.groups.length, 1);
          done();
        });
      });
    });
    describe('groups.findGroups method', function () {
      it('fetches a page of groups', function () {
        let results = findGroups._execute({ userId }, { pageSize: 3 });
        assert.equal(results.data.length, 3);
        assert.equal(results.page, 1);
        assert.equal(results.totalCount, 4);
        // fetch page 2
        results = findGroups._execute({ userId }, { pageSize: 3, page: 2 });
        assert.equal(results.data.length, 1);
        assert.equal(results.page, 2);
        assert.equal(results.totalCount, 4);
      });
      it('fetches a page of groups with a filter', function () {
        const { data, page, totalCount } = findGroups._execute({ userId }, { filter: 'MonGroupe' });
        assert.equal(data.length, 1);
        assert.equal(page, 1);
        assert.equal(totalCount, 1);
        assert.notProperty(data[0].name, 'MonGroupe');
      });
    });
  });
  describe('methods', function () {
    let groupId;
    let group2Id;
    let group3Id;
    let group4Id;
    let moderatedGroupId;
    let closedGroupId;
    let userId;
    let adminId;
    let otherUserId;
    beforeEach(function () {
      // Clear
      Groups.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Roles.createRole('admin');
      Roles.createRole('animator');
      Roles.createRole('member');
      Roles.createRole('candidate');
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      const emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      const emailOtherUser = faker.internet.email();
      otherUserId = Accounts.createUser({
        email: emailOtherUser,
        username: emailOtherUser,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      // Create a group owned by userId
      groupId = Factory.create('group', { owner: userId })._id;
      setAdminOf._execute({ userId: adminId }, { userId, groupId });
      // Create a group owned by random user and set userId as admin
      group2Id = Factory.create('group', { owner: Random.id() })._id;
      group3Id = Factory.create('group', { owner: Random.id() })._id;
      group4Id = Factory.create('group', { name: 'group4', owner: userId })._id;
      setAdminOf._execute({ userId: adminId }, { userId, groupId: group4Id });
      // create moderated/closed groups
      moderatedGroupId = Factory.create('group', { type: 5, owner: Random.id() })._id;
      closedGroupId = Factory.create('group', { type: 10, owner: Random.id() })._id;
      setAdminOf._execute({ userId: adminId }, { userId, groupId: group2Id });
    });
    describe('(un)setAdminOf', function () {
      it('global admin can set/unset a user as admin of a group', function () {
        setAdminOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'admin', group3Id), true);
        assert.include(group.admins, userId, 'group admins list contains userId');
        unsetAdminOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'admin', group3Id), false);
        assert.notInclude(group.admins, userId, "group admins list shouldn't contain userId");
      });
      it('group admin can set/unset a user as admin of a group', function () {
        setAdminOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'admin', group2Id), true);
        assert.include(group.admins, otherUserId, 'group admins list contains otherUserId');
        unsetAdminOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'admin', group2Id), false);
        assert.notInclude(group.admins, otherUserId, "group admins list shouldn't contain otherUserId");
      });
      it('only global or group admin can set/unset a user as admin of a group', function () {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            setAdminOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.setAdminOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdminOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.unsetAdminOf.notPermitted/,
        );
      });
    });
    describe('(un)setAnimatorOf', function () {
      it('global admin can set/unset a user as animator of a group', function () {
        setAnimatorOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'animator', group3Id), true);
        assert.include(group.animators, userId, 'group animators list contains userId');
        unsetAnimatorOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'animator', group3Id), false);
        assert.notInclude(group.animators, userId, "group animators list shouldn't contain userId");
      });
      it('group admin can set/unset a user as animator of a group', function () {
        setAnimatorOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'animator', group2Id), true);
        assert.include(group.animators, otherUserId, 'group animators list contains otherUserId');
        unsetAnimatorOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'animator', group2Id), false);
        assert.notInclude(group.animators, otherUserId, "group animators list shouldn't contain otherUserId");
      });
      it('only global or group admin can set/unset a user as animator of a group', function () {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            setAnimatorOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.setAnimatorOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAnimatorOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.unsetAnimatorOf.notPermitted/,
        );
      });
    });
    describe('(un)setMemberOf', function () {
      it('global admin can set/unset a user as member of a group', function () {
        setMemberOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group3Id), true);
        assert.include(group.members, userId, 'group members list contains userId');
        unsetMemberOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group3Id), false);
        assert.notInclude(group.members, userId, "group members list shouldn't contain userId");
      });
      it('group admin can set/unset a user as member of a group', function () {
        setMemberOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'member', group2Id), true);
        assert.include(group.members, otherUserId, 'group members list contains otherUserId');
        unsetMemberOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'member', group2Id), false);
        assert.notInclude(group.members, otherUserId, "group members list shouldn't contain otherUserId");
      });
      it('group animator can set/unset a user as member of a group', function () {
        setAnimatorOf._execute({ userId: adminId }, { userId: otherUserId, groupId: group2Id });
        setMemberOf._execute({ userId: otherUserId }, { userId, groupId: group2Id });
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group2Id), true);
        assert.include(group.members, userId, 'group members list contains userId');
        unsetMemberOf._execute({ userId: otherUserId }, { userId, groupId: group2Id });
        group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group2Id), false);
        assert.notInclude(group.members, userId, "group members list shouldn't contain userId");
      });
      it('normal user can set/unset himself as member only for open groups', function () {
        setMemberOf._execute({ userId }, { userId, groupId: group3Id });
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group3Id), true);
        assert.include(group.members, userId, 'group members list contains userId');
        unsetMemberOf._execute({ userId }, { userId, groupId: group3Id });
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group3Id), false);
        assert.notInclude(group.members, userId, "group members list shouldn't contain userId");
        assert.throws(
          () => {
            setMemberOf._execute({ userId }, { userId, groupId: moderatedGroupId });
          },
          Meteor.Error,
          /api.users.setMemberOf.notPermitted/,
        );
        assert.throws(
          () => {
            setMemberOf._execute({ userId }, { userId, groupId: closedGroupId });
          },
          Meteor.Error,
          /api.users.setMemberOf.notPermitted/,
        );
      });
      it('normal users can not set/unset another user as member of a group', function () {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            setMemberOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.setMemberOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetMemberOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.unsetMemberOf.notPermitted/,
        );
        assert.throws(
          () => {
            setMemberOf._execute({ userId: otherUserId }, { userId, groupId: moderatedGroupId });
          },
          Meteor.Error,
          /api.users.setMemberOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetMemberOf._execute({ userId: otherUserId }, { userId, groupId: moderatedGroupId });
          },
          Meteor.Error,
          /api.users.unsetMemberOf.notPermitted/,
        );
        assert.throws(
          () => {
            setMemberOf._execute({ userId: otherUserId }, { userId, groupId: closedGroupId });
          },
          Meteor.Error,
          /api.users.setMemberOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetMemberOf._execute({ userId: otherUserId }, { userId, groupId: closedGroupId });
          },
          Meteor.Error,
          /api.users.unsetMemberOf.notPermitted/,
        );
      });
    });
    describe('(un)setCandidateOf', function () {
      it('global admin can set/unset a user as candidate of a moderated group only', function () {
        setCandidateOf._execute({ userId: adminId }, { userId, groupId: moderatedGroupId });
        let group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(userId, 'candidate', moderatedGroupId), true);
        assert.include(group.candidates, userId, 'group candidates list contains userId');
        unsetCandidateOf._execute({ userId: adminId }, { userId, groupId: moderatedGroupId });
        group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(userId, 'candidate', moderatedGroupId), false);
        assert.notInclude(group.candidates, userId, "group candidates list shouldn't contain userId");
        // the 2 below exceptions will be tested only for global admin (depends on group type, not user permissions)
        assert.throws(
          () => {
            setCandidateOf._execute({ userId: adminId }, { userId, groupId: closedGroupId });
          },
          Meteor.Error,
          /api.users.setCandidateOf.moderatedGroupOnly/,
        );
        assert.throws(
          () => {
            setCandidateOf._execute({ userId: adminId }, { userId, groupId: group2Id });
          },
          Meteor.Error,
          /api.users.setCandidateOf.moderatedGroupOnly/,
        );
      });
      it('group admin can set/unset a user as candidate of a moderated group', function () {
        setAdminOf._execute({ userId: adminId }, { userId, groupId: moderatedGroupId });
        setCandidateOf._execute({ userId }, { userId: otherUserId, groupId: moderatedGroupId });
        let group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(otherUserId, 'candidate', moderatedGroupId), true);
        assert.include(group.candidates, otherUserId, 'group candidates list contains userId');
        unsetCandidateOf._execute({ userId }, { userId: otherUserId, groupId: moderatedGroupId });
        group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(otherUserId, 'candidate', moderatedGroupId), false);
        assert.notInclude(group.candidates, otherUserId, "group candidates list shouldn't contain userId");
      });
      it('group animator can set/unset a user as candidate of a moderated group', function () {
        setAnimatorOf._execute({ userId: adminId }, { userId: otherUserId, groupId: moderatedGroupId });
        setCandidateOf._execute({ userId: otherUserId }, { userId, groupId: moderatedGroupId });
        let group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(userId, 'candidate', moderatedGroupId), true);
        assert.include(group.candidates, userId, 'group candidates list contains userId');
        unsetCandidateOf._execute({ userId: otherUserId }, { userId, groupId: moderatedGroupId });
        group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(userId, 'candidate', moderatedGroupId), false);
        assert.notInclude(group.candidates, userId, "group candidates list shouldn't contain userId");
      });
      it('normal user can set/unset himself as candidate only for moderated groups', function () {
        setCandidateOf._execute({ userId }, { userId, groupId: moderatedGroupId });
        let group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(userId, 'candidate', moderatedGroupId), true);
        assert.include(group.candidates, userId, 'group candidates list contains userId');
        unsetCandidateOf._execute({ userId }, { userId, groupId: moderatedGroupId });
        group = Groups.findOne(moderatedGroupId);
        assert.equal(Roles.userIsInRole(userId, 'candidate', moderatedGroupId), false);
        assert.notInclude(group.candidates, userId, "group candidates list shouldn't contain userId");
      });
      it('normal users can not set/unset another user as candidate of a group', function () {
        assert.throws(
          () => {
            setCandidateOf._execute({ userId: otherUserId }, { userId, groupId: moderatedGroupId });
          },
          Meteor.Error,
          /api.users.setCandidateOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetCandidateOf._execute({ userId: otherUserId }, { userId, groupId: moderatedGroupId });
          },
          Meteor.Error,
          /api.users.unsetCandidateOf.notPermitted/,
        );
      });
    });
    describe('createGroup', function () {
      it('does create a group and set current user as owner', function () {
        createGroup._execute(
          { userId },
          {
            name: 'mongroupe',
            type: 0,
            description: 'une description',
            content: 'une note',
          },
        );
        const group = Groups.findOne({ name: 'mongroupe' });
        assert.typeOf(group, 'object');
        assert.equal(group.active, true);
        assert.equal(group.owner, userId);
        assert.equal(Roles.userIsInRole(userId, 'admin', group._id), true);
      });
      it('does fail to create a group if name already taken', function () {
        assert.throws(
          () => {
            createGroup._execute(
              { userId },
              {
                name: 'group4',
                type: 0,
                description: 'une description',
                content: 'une note',
              },
            );
          },
          Error,
          /E11000 duplicate key error collection: meteor.groups index: c2_name dup key: { : "group4" }/,
        );
      });
      it('does not create a group when not logged in', function () {
        assert.throws(
          () => {
            createGroup._execute(
              {},
              {
                name: 'mongroupe',
                type: 0,
                description: 'une description',
                content: 'une note',
              },
            );
          },
          Meteor.Error,
          /api.groups.createGroup.notLoggedIn/,
        );
      });
    });
    describe('removeGroup', function () {
      it("does not delete a group you don't own or are admin of", function () {
        // Throws if non owner/admin user, or logged out user, tries to delete the group
        assert.throws(
          () => {
            removeGroup._execute({ userId }, { groupId: group3Id });
          },
          Meteor.Error,
          /api.groups.removeGroup.notPermitted/,
        );
        assert.throws(
          () => {
            removeGroup._execute({}, { groupId });
          },
          Meteor.Error,
          /api.groups.removeGroup.notPermitted/,
        );
      });
      it('does delete a group you own', function () {
        removeGroup._execute({ userId }, { groupId });
        assert.equal(Groups.findOne(groupId), undefined);
      });
      it('does delete a group you are admin of', function () {
        removeGroup._execute({ userId }, { groupId: group2Id });
        assert.equal(Groups.findOne(group2Id), undefined);
      });
      it('does delete any group when you are global admin', function () {
        removeGroup._execute({ userId: adminId }, { groupId: group3Id });
        assert.equal(Groups.findOne(group3Id), undefined);
      });
    });
    describe('updateGroup', function () {
      it("does not update a group you don't own or are admin of", function () {
        // Throws if non owner/admin user, or logged out user, tries to delete the group
        assert.throws(
          () => {
            updateGroup._execute({ userId }, { groupId: group3Id, data: { description: 'test' } });
          },
          Meteor.Error,
          /api.groups.updateGroup.notPermitted/,
        );
        assert.throws(
          () => {
            updateGroup._execute({}, { groupId, data: { description: 'test' } });
          },
          Meteor.Error,
          /api.groups.updateGroup.notPermitted/,
        );
      });
      it('does update a group you own', function () {
        updateGroup._execute({ userId }, { groupId, data: { description: 'test' } });
        assert.equal(Groups.findOne(groupId).description, 'test');
      });
      it('does update a group you are admin of', function () {
        updateGroup._execute({ userId }, { groupId: group2Id, data: { description: 'test' } });
        assert.equal(Groups.findOne(group2Id).description, 'test');
      });
      it('does update any group when you are global admin', function () {
        updateGroup._execute({ userId: adminId }, { groupId: group3Id, data: { description: 'test' } });
        assert.equal(Groups.findOne(group3Id).description, 'test');
      });
      it('does fail to update group if name already taken', function () {
        assert.throws(
          () => {
            updateGroup._execute({ userId }, { groupId, data: { name: 'group4' } });
          },
          Meteor.ClientError,
          /E11000 duplicate key error collection: meteor.groups index: c2_name dup key: { : "group4" }/,
        );
      });
    });
  });
});
