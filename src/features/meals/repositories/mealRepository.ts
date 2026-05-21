/**
 * Meal Repository
 * 
 * Repository pattern for meals data access.
 * Separates data access from business logic.
 */

import { supabase } from '@/services/api/supabase';

export interface Meal {
  id: string;
  name: string;
  type: string;
  category: string;
  date: string;
  calories?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Fetch all meals for user
 */
export const fetchMeals = async (userId: string): Promise<Meal[]> => {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('userId', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch meal by ID
 */
export const fetchMealById = async (id: string): Promise<Meal | null> => {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create meal
 */
export const createMeal = async (meal: Partial<Meal>): Promise<Meal> => {
  const { data, error } = await supabase
    .from('meals')
    .insert(meal)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update meal
 */
export const updateMeal = async (id: string, updates: Partial<Meal>): Promise<Meal> => {
  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete meal
 */
export const deleteMeal = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
