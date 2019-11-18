// import i18n translation files
import "../locales.js";

// Set up some rate limiting and other important security settings.
import "./security.js";

// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import "./register-api";

// Set up some initial accounts if no users exist
import "./Accounts";
