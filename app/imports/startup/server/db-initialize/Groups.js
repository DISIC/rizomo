import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { Roles } from 'meteor/alanning:roles';
import Groups from '../../../api/groups/groups';
import { createGroup } from '../../../api/groups/methods';
import fakeData from './fakeData.json';

const users = (number) => {
  const limit = Math.floor(Math.random() * number);
  const skip = Math.floor(Math.random() * 1000);
  return Meteor.users.find({}, { limit, skip, fields: { _id: 1 } }).map(({ _id }) => _id);
};

/** When running app for first time, pass a settings file to set up default groups. */
if (Groups.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    console.log('Creating the default groups');
    fakeData.defaultGroups.map(({
      owner, name, type, description, content,
    }) => {
      // find owner userId
      const user = Meteor.users.findOne({ username: owner });
      if (!user) {
        console.log(`can not create group ${name}: owner not found in database`);
      } else {
        console.log(`  Creating group ${name}.`);

        if (Meteor.isDevelopment) {
          const groupId = Groups.insert({
            name,
            type,
            content,
            description,
            owner: user._id,
            admins: [user._id],
            active: true,
            animators: users(10),
            members: users(1000),
            candidates: users(100),
          });
          Roles.addUsersToRoles(user._id, 'admin', groupId);
        } else {
          createGroup._execute(
            { userId: user._id },
            {
              name,
              type,
              description,
              content,
            },
          );
        }
      }
      return name;
    });
    if (Meteor.isDevelopment) {
      const ANIMATORS_RANDOM = 10;
      const MEMBERS_RANDOM = 100;
      const CANDIDATES_RANDOM = 50;
      const NUMBER_OF_FAKE_GROUPS = 100;

      const array = new Array(NUMBER_OF_FAKE_GROUPS);
      array.fill(0);
      const usersLength = Meteor.users.find().count();
      array.forEach(() => {
        const owner = Meteor.users.findOne({}, { skip: Math.floor(Math.random() * usersLength) })._id;
        const name = faker.company.catchPhrase();
        const type = [0, 5, 10, 0][Math.floor(Math.random() * 3)];
        const animators = users(ANIMATORS_RANDOM);
        const members = users(MEMBERS_RANDOM);
        const candidates = type === 5 ? users(CANDIDATES_RANDOM) : [];
        console.log(`  Creating group ${name}.`);
        const groupId = Groups.insert({
          name,
          type,
          description: faker.lorem.sentence(),
          content: faker.lorem.sentence(),
          groupPadID: faker.internet.password(),
          owner,
          admins: [owner],
          active: true,
          animators,
          members,
          candidates,
        });
        Roles.addUsersToRoles(owner, 'admin', groupId);
        Roles.addUsersToRoles(animators, 'animator', groupId);
        Roles.addUsersToRoles(members, 'member', groupId);
        Roles.addUsersToRoles(candidates, 'candidate', groupId);
      });
    }
  } else {
    console.log('No default groups to create !  Please invoke meteor with a settings file.');
  }
}
