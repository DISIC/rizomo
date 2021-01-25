import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { createNotification } from './notifications/methods';

const levels = ['info', 'warning', 'error'];

function logServer(message, level = 'info', userNotify = null) {
  if (!levels.includes(level)) throw new Meteor.Error('api.logging.logServer', i18n.__('api.logging.unknownLogLevel'));
  console.log(message);
  if (userNotify) {
    const user = Meteor.users.findOne(userNotify);
    if (user) {
      const notifData = {
        userId: userNotify,
        title: i18n.__(`api.logging.${level}`),
        content: message,
        type: level,
      };
      createNotification._execute({}, { data: notifData });
    }
  }
}

export default logServer;
