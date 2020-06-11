import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import Notifications from '../notifications';

// export async function getNotifications(req, content) {
//   let query = {};
//   if (req.parameters.userid) query = { userId: req.parameters.userid };
//   return Notifications.find(query).fetch();
// }

export default async function addNotification(req, content) {
  // sample use:
  // curl -X  POST -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" \
  //      -H "Content-Type: application/json" \
  //      -d '{"userId":"eZRRKbaTDty4Xk4kX", "title":"test", "content":"test notif par API", "type":"info"}' \
  //      http://localhost:3000/api/notifications
  // userId key can be replaced by email or username key

  // find user by _id, username or email
  const userData = { ...content };
  let user;
  if (content.email) {
    user = Accounts.findUserByEmail(content.email);
    delete userData.email;
    if (user) userData.userId = user._id;
  } else if (content.username) {
    user = Accounts.findUserByUsername(content.username);
    delete userData.username;
    if (user) userData.userId = user._id;
  } else if (content.userId) {
    user = Meteor.users.findOne(userData.userId);
  }
  // check that user exists
  if (user === undefined) {
    throw new Meteor.Error('restapi.notifications.addNotifications.unknownUser', i18n.__('api.users.unknownUser'));
  }

  return Notifications.insert(userData);
}
