import { Meteor } from 'meteor/meteor';
import Categories from '../../../api/categories/categories';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';

function createCategorie(categorie) {
  logServer(`  Creating categorie ${categorie.name}.`);
  Categories.insert(categorie);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Categories.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer('Creating the default categories');
    fakeData.defaultCategories.map((categorie) => createCategorie(categorie));
  } else {
    logServer('No default categories to create !  Please invoke meteor with a settings file.');
  }
}
