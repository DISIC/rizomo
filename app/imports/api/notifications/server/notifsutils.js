import i18n from 'meteor/universe:i18n';
// import AppRoles from '../users/users';
import Groups from '../../groups/groups';
import { createNotification } from '../methods';

/**
 * Send a notification for role change of user in a group
 * @param currentUser {string} User ID who ask to send notification
 * @param userId {string} User ID to send notification
 * @param groupId {string} Group ID concerned by the role change
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
      link: `/groups/${group.slug}`,
      type,
    };
    createNotification._execute({ userId: currentUser }, { data: newNotif });
  }
}

/**
 * Send a request notification to admin or animator about a group
 * @param currentUser {string} User ID who ask to send notification
 * @param userId {string} User ID which is candidate for the group
 * @param groupId {string} Group ID concerned
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
      link: `/admingroups/${groupId}`,
      type: 'request',
    };
    if (currentUser !== uid) {
      createNotification._execute({ userId: currentUser }, { data: newNotif });
    }
  });
}

/**
 * Send a notification to all members/animators/admins of a group
 * @param currentUser {string} User ID who ask to send notification
 * @param groupId {string} Group ID concerned
 * @param title {string} Notification title to be send
 * @param content {string} Notification content to be send
 * @param link {string optionnal} Destination link of notification, default link to group page
 */
export function createGroupNotification(currentUser, groupId, title, content, link = '') {
  const group = Groups.findOne({ _id: groupId }, { fields: Groups.adminFields });
  const usersToSend = [...new Set([...group.admins, ...group.animators, ...group.members])]; // Concats arrays and removes duplicate user ids
  const notifLink = link === '' ? `/groups/${group.slug}` : link;
  usersToSend.forEach((uid) => {
    const newNotif = { userId: uid, title, content, link: notifLink, type: 'group' };
    createNotification._execute({ userId: currentUser }, { data: newNotif });
  });
}

/**
 * Send a notification to a pull of users
 * @param currentUser {string} User ID who ask to send notification
 * @param users {array} Users ID to send notification
 * @param title {string} Notification title to be send
 * @param content {string} Notification content to be send
 * @param link {string} Destination link of notification
 */
export function createMultiUsersNotification(currentUser, users, title, content, link) {
  users.forEach((uid) => {
    const newNotif = { userId: uid, title, content, type: 'group', link };
    createNotification._execute({ userId: currentUser }, { data: newNotif });
  });
}
