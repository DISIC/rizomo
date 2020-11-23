import { Meteor } from 'meteor/meteor';
import Tags from '../../../api/tags/tags';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';

function createTag(tag) {
  logServer(`  Creating tag ${tag.name}.`);
  Tags.insert(tag);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Tags.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer('Creating the default tags');
    if (fakeData.defaultTags !== undefined) {
      fakeData.defaultTags.map((tag) => createTag(tag));
    }
  } else {
    logServer('No default tags to create !  Please invoke meteor with a settings file.');
  }
}
