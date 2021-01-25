import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { registerSchemaMessages } from '../../../api/utils';

// SimpleSchema.debug = true;

SimpleSchema.defineValidationErrorTransform((error) => {
  const ddpError = new Meteor.Error(error.message);
  ddpError.error = 'validation-error';
  ddpError.details = error.details;
  return ddpError;
});

// setup translated validation messages
registerSchemaMessages();
