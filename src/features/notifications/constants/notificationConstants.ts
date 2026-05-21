/**
 * Notification Constants
 * 
 * Feature-specific constants for notifications.
 */

export const NOTIFICATION_TYPES = {
  TASK_REMINDER: 'task_reminder',
  HABIT_REMINDER: 'habit_reminder',
  MEAL_REMINDER: 'meal_reminder',
  WELLNESS_CHECK: 'wellness_check',
  SYNC_COMPLETE: 'sync_complete',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const NOTIFICATION_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  DISMISSED: 'dismissed',
} as const;
