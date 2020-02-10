// import i18n translation files
import '../locales';

// Set up some rate limiting and other important security settings.
import './security';

// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import './ValidationError';
import './register-api';

// Set up roles, initial accounts and services
import './Accounts';
import './Groups';
import './Services';
import './Categories';
