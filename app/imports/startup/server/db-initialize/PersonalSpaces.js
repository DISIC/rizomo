import { Meteor } from 'meteor/meteor';
import PersonalSpaces from '../../../api/personalspaces/personalspaces';
import fakeData from './fakeData.json';

function createPersonalSpaces(personalspace) {
  const { userId } = personalspace; // in fakeData file, userId is set to user mail
  console.log(`  Creating personalspace ${userId}.`);
  const user = Accounts.findUserByEmail(userId);
  PersonalSpaces.insert({ ...personalspace, userId: user._id });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (PersonalSpaces.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    console.log('Creating the default personalspaces');
    fakeData.defaultPersonalSpaces.map(createPersonalSpaces);
  } else {
    console.log('No default personalspaces to create !  Please invoke meteor with a settings file.');
  }
}
