import { Migrations } from 'meteor/percolate:migrations';
import { Meteor } from 'meteor/meteor';

// import i18n translation files
import '../locales';

// Set up some rate limiting and other important security settings.
import './config/security';

// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import './config/ValidationError';
import './register-api';
import '../../api/restApi';

// Set up roles, initial accounts and services
import './db-initialize/Accounts';
import './db-initialize/Services';
import './db-initialize/Categories';
import './db-initialize/Groups';
import './db-initialize/Articles';
import './db-initialize/AppSettings';
import './db-initialize/PersonalSpaces';

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
