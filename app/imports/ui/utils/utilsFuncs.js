import { Meteor } from 'meteor/meteor';

export const isUrlExternal = (url) => {
  if (url.search(Meteor.absoluteUrl()) === -1 && url.search('http') !== -1) {
    return true;
  }
  return false;
};

// delete when there is more than one function in this file
export const tempFunction = (args) => console.log(args);
