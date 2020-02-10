import { Meteor } from 'meteor/meteor';
import Services from '../../api/services/services';

function createService(title, description, url, logo, categories) {
  console.log(`  Creating service ${title}.`);
  Services.insert({
    title,
    description,
    url,
    logo,
    categories,
  });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Services.find().count() === 0) {
  if (Meteor.settings.defaultServices) {
    console.log('Creating the default services');
    Meteor.settings.defaultServices.map(({
      title, description, url, logo, categories,
    }) => createService(title, description, url, logo, categories));
  } else {
    console.log('No default services to create !  Please invoke meteor with a settings file.');
  }
}
