import { Meteor } from 'meteor/meteor';
import PersonalSpaces from '../../../api/personalspaces/personalspaces';
import { updatePersonalSpace } from '../../../api/personalspaces/methods';
import logServer from '../../../api/logging';
// import fakeData from './fakeData.json';

// function createPersonalSpaces(personalspace) {
//   const { userId } = personalspace; // in fakeData file, userId is set to user mail
//   logServer(`  Creating personalspace ${userId}.`);
//   const user = Accounts.findUserByEmail(userId);
//   PersonalSpaces.insert({ ...personalspace, userId: user._id });
// }

// /** When running app for first time, pass a settings file to set up a default user account. */
// if (PersonalSpaces.find().count() === 0) {
//   if (Meteor.settings.private.fillWithFakeData) {
//     logServer('Creating the default personalspaces');
//     fakeData.defaultPersonalSpaces.map(createPersonalSpaces);
//   } else {
//     logServer('No default personalspaces to create !  Please invoke meteor with a settings file.');
//   }
// }

if (Meteor.isDevelopment) {
  // Regen users empty personalspace with current fav services and group roles
  const usersWithEmptyPS = PersonalSpaces.find({ unsorted: [], sorted: [] }, { fields: { userId: 1, _id: 0 } });
  usersWithEmptyPS.forEach((user) => {
    const u = Meteor.users.findOne({ _id: user.userId }, { fields: { username: 1, favServices: 1, favGroups: 1 } });
    if (u === undefined) {
      logServer(`Error: user "${user.userId}" not found while updating PersonalSpaces`, 'error');
    } else {
      logServer(`XXX : ${JSON.stringify(user)}`);
      logServer(`Regen personalspaces for ${u.username}...`);
      const unsorted = [];
      u.favServices.forEach((s) => {
        unsorted.push({
          element_id: s,
          type: 'service',
        });
      });
      u.favGroups.forEach((g) => {
        unsorted.push({
          element_id: g,
          type: 'group',
        });
      });
      updatePersonalSpace._execute({ userId: user.userId }, { data: { userId: user.userId, unsorted, sorted: [] } });
    }
  });
}
