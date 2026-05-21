/**
 * Notification Selectors
 * 
 * Derived state selectors for notifications.
 * Memoized for performance.
 */

/**
 * Select unread notifications
 */
export const selectUnreadNotifications = (notifications: any[]) => {
  return notifications.filter((notification) => notification.status === 'delivered');
};

/**
 * Select notifications by type
 */
export const selectNotificationsByType = (notifications: any[], type: string) => {
  return notifications.filter((notification) => notification.type === type);
};

/**
 * Select notifications by priority
 */
export const selectNotificationsByPriority = (notifications: any[], priority: string) => {
  return notifications.filter((notification) => notification.priority === priority);
};

/**
 * Select urgent notifications
 */
export const selectUrgentNotifications = (notifications: any[]) => {
  return notifications.filter((notification) => notification.priority === 'urgent');
};
