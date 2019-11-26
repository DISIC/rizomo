import { Meteor } from 'meteor/meteor';

import Services from '../services';

// publish additional fields for users
Meteor.publish('services.all', () => Services.find({}, { fields: Services.publicFields }));
