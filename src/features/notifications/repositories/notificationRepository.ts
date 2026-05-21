/**
 * Notification Repository
 * 
 * Repository pattern for notifications data access.
 * Separates data access from business logic.
 */

import { supabase } from '@/services/api/supabase';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: string;
  status: string;
  scheduledAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Fetch all notifications for user
 */
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch unread notifications for user
 */
export const fetchUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('userId', userId)
    .eq('status', 'delivered')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Create notification
 */
export const createNotification = async (notification: Partial<Notification>): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update notification
 */
export const updateNotification = async (id: string, updates: Partial<Notification>): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete notification
 */
export const deleteNotification = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
