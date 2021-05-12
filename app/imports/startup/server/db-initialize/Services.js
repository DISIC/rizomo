import { Meteor } from 'meteor/meteor';
import Services from '../../../api/services/services';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';

function createService(service) {
  const { title } = service;
  logServer(`  Creating service ${title}.`);
  Services.insert({ ...service, structure: '' });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Services.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer('Creating the default services');
    fakeData.defaultServices.map(createService);
  } else {
    logServer('No default services to create !  Please invoke meteor with a settings file.');
  }
}
