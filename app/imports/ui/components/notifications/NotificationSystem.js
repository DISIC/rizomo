export default function notificationSystem(title, options) {
  if (Notification.permission === 'granted') {
    // eslint-disable-next-line
    const notification = new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function notifySystem(permission) {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }
      if (permission === 'granted') {
        // eslint-disable-next-line
        const notification = new Notification(title, options);
      }
    });
  }
}
