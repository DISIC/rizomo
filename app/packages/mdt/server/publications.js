import { collections } from './methods';

Meteor.publish('MDT.autopublish', () => Object.keys(collections).map((name) => collections[name].find()));
