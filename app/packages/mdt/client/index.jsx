import React from 'react';
import ReactDOM from 'react-dom';
import DevTools from './DevTools';

Meteor.startup(() => {
  const target = document.createElement('div');
  target.setAttribute('id', 'mexar-devtools');
  document.body.appendChild(target);
  ReactDOM.render(<DevTools />, document.getElementById('mexar-devtools'));
});

export const name = 'meteor-devtools';
