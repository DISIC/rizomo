import { Meteor } from 'meteor/meteor';
import Categories from '../../../api/categories/categories';
import fakeData from './fakeData.json';

function createCategorie(categorie) {
  console.log(`  Creating categorie ${categorie.name}.`);
  Categories.insert(categorie);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Categories.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    console.log('Creating the default categories');
    fakeData.defaultCategories.map((categorie) => createCategorie(categorie));
  } else {
    console.log('No default categories to create !  Please invoke meteor with a settings file.');
  }
}
