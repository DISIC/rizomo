Package.describe({
  name: 'mexar:mdt',
  version: '0.2.1',
  // Brief, one-line summary of the package.
  summary: 'Some open source toys to play in meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/MeXaaR/mdt.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
  debugOnly: true,
});

Package.onUse((api) => {
  api.versionsFrom(['1.9', '2.3']);
  api.use('ecmascript');
  api.use('mongo');
  api.use('tracker');
  api.use('accounts-password');
  api.mainModule('./client/index.jsx', 'client');
  api.mainModule('./server/index.js', 'server');
  // Client Files
  api.addFiles([], 'client');
});

// TO DO TESTS
// Package.onTest((api) => {
//   api.use('ecmascript');
//   api.use('tinytest');
//   api.use('mdt');
//   api.mainModule('mdt-tests.js');
// });

// This lets you use npm packages in your package:
Npm.depends({
  react: '16.10.0',
  'react-dom': '16.10.0',
  'styled-components': '5.0.1',
  'react-json-view': '1.19.1',
});
