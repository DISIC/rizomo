import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

import '../locales';
import App from '../../ui/layouts/App';

function getLang() {
  return (
    (navigator.languages && navigator.languages[0])
    || navigator.language
    || navigator.browserLanguage
    || navigator.userLanguage
    || 'en-US'
  );
}

/** Startup the application by rendering the App layout component. */
Meteor.startup(() => {
  i18n.setLocale(getLang());
  render(<App />, document.getElementById('root')); // eslint-disable-line
});
