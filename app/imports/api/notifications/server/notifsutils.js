import i18n from 'meteor/universe:i18n';
// import AppRoles from '../users/users';
import Groups from '../../groups/groups';
import { createNotification } from '../methods';

/**
 * Send a notification for role change of user in a group
 * @param currentUser {string id} User ID who ask to send notification
 * @param userId {string id} User ID to send notification
 * @param groupId {string id} Group ID concerned by the role change
 * @param role {string} role type // TODO: check if role in AppRoles ?
 * @param setRole {bool} true = set new role for the group, false = unset role
 */
export function createRoleNotification(currentUser, userId, groupId, role, setRole = true) {
  // TODO: check role in AppRoles ?
  const group = Groups.findOne({ _id: groupId });
  if (group !== undefined) {
    const type = setRole ? 'setRole' : 'unsetRole';
    const roleLabel = i18n.__(`api.notifications.labels.roles.${role}`);
    const newNotif = {
      userId,
      title: i18n.__(`api.notifications.${type}NotifTitle`),
      content: i18n.__(`api.notifications.${type}NotifContent`, {
        role: roleLabel,
        group: group.name,
      }),
      type,
    };
    createNotification._execute({ userId: currentUser }, { data: newNotif });
  }
}
/**
 * Send a request notification to admin or animator about a group
 * @param currentUser {string id} User ID who ask to send notification
 * @param userId {string id} User ID which is candidate for the group
 * @param groupId {string id} Group ID concerned
 */
export function createRequestNotification(currentUser, userId, groupId) {
  const user = Meteor.users.findOne(userId);
  const group = Groups.findOne({ _id: groupId }, { fields: Groups.adminFields });
  const usersToSend = [...new Set([...group.admins, ...group.animators])]; // Concats arrays and removes duplicate user ids
  usersToSend.forEach((uid) => {
    const newNotif = {
      userId: uid,
      title: i18n.__('api.notifications.requestNotifTitle'),
      content: i18n.__('api.notifications.requestNotifContent', {
        name: user.username,
        group: group.name,
      }),
      type: 'request',
    };
    if (currentUser !== uid) {
      createNotification._execute({ userId: currentUser }, { data: newNotif });
    }
  });
}
