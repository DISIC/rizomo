import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Quill } from 'react-quill';
import '../locales';
import App from '../../ui/layouts/App';
import getLang from '../../ui/utils/getLang';
import { registerSchemaMessages } from '../../api/utils';

/** Startup the application by rendering the App layout component. */
Meteor.startup(() => {
  window.Quill = Quill;
  i18n.setLocale(getLang());
  // setup translated validation messages
  registerSchemaMessages();
  render(<App />, document.getElementById('root')); // eslint-disable-line
});
