/**
 * Habit Repository
 * 
 * Repository pattern for habits data access.
 * Separates data access from business logic.
 */

import { supabase } from '@/services/api/supabase';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  frequency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Fetch all habits for user
 */
export const fetchHabits = async (userId: string): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch habit by ID
 */
export const fetchHabitById = async (id: string): Promise<Habit | null> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create habit
 */
export const createHabit = async (habit: Partial<Habit>): Promise<Habit> => {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update habit
 */
export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit> => {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete habit
 */
export const deleteHabit = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
