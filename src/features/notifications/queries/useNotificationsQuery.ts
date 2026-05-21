/**
 * Notifications Query Hooks
 * 
 * React Query hooks for notifications feature.
 * Remote cache for Supabase data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query';

// Mock fetch function - replace with actual repository call
const fetchNotifications = async () => {
  // TODO: Replace with actual repository call
  return [];
};

const fetchUnreadNotifications = async () => {
  // TODO: Replace with actual repository call
  return [];
};

/**
 * Query for all notifications
 */
export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: queryKeys.notifications.lists(),
    queryFn: fetchNotifications,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Query for unread notifications
 */
export const useUnreadNotificationsQuery = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: fetchUnreadNotifications,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Mutation for marking notification as read
 */
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual repository call
      return { id, status: 'read' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(),
      });
    },
  });
};

/**
 * Mutation for dismissing notification
 */
export const useDismissNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual repository call
      return { id, status: 'dismissed' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(),
      });
    },
  });
};
