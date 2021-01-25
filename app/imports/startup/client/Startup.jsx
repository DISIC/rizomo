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
  // setup client side login hook
  Accounts.onLogin(() => {
    const rememberMe = window.localStorage.getItem('rememberMe') || 'false';
    if (rememberMe === 'false') {
      // warns user when he closes window / reloads page
      window.onbeforeunload = function onBeforeUnload(event) {
        // Cancel the event as stated by the standard.
        event.preventDefault();
        // Safari
        return '';
      };
      // disconnect user if 'remember me' is disabled
      window.onunload = function onUnload() {
        Meteor.logout();
        window.localStorage.clear('Meteor.loginToken');
        window.localStorage.clear('Meteor.loginTokenExpires');
        window.localStorage.clear('Meteor.userId');
      };
    }
  });
  render(<App />, document.getElementById('root')); // eslint-disable-line
});
