/**
 * Notification Query Keys
 * 
 * Feature-specific query keys for notifications.
 * Extends centralized query keys with notification-specific helpers.
 */

import { queryKeys } from '@/services/query';

export const notificationQueryKeys = {
  ...queryKeys.notifications,
  
  // Additional notification-specific keys
  byType: (type: string) => ['notifications', 'type', type] as const,
  byPriority: (priority: string) => ['notifications', 'priority', priority] as const,
  byStatus: (status: string) => ['notifications', 'status', status] as const,
} as const;
