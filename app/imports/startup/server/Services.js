import { Meteor } from 'meteor/meteor';
import Services from '../../api/services/services';
import fakeData from './fakeData';

function createService(service) {
  const { title } = service;
  console.log(`  Creating service ${title}.`);
  Services.insert(service);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Services.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    console.log('Creating the default services');
    fakeData.defaultServices.map(createService);
  } else {
    console.log('No default services to create !  Please invoke meteor with a settings file.');
  }
}
