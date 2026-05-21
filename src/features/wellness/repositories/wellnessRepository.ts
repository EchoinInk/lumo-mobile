/**
 * Wellness Repository
 * 
 * Repository pattern for wellness data access.
 * Separates data access from business logic.
 */

import { supabase } from '@/services/api/supabase';

export interface MoodEntry {
  id: string;
  level: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface EnergyEntry {
  id: string;
  level: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface SleepEntry {
  id: string;
  quality: string;
  duration?: number;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Fetch mood entries for user
 */
export const fetchMoodEntries = async (userId: string): Promise<MoodEntry[]> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('userId', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch energy entries for user
 */
export const fetchEnergyEntries = async (userId: string): Promise<EnergyEntry[]> => {
  const { data, error } = await supabase
    .from('energy_entries')
    .select('*')
    .eq('userId', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch sleep entries for user
 */
export const fetchSleepEntries = async (userId: string): Promise<SleepEntry[]> => {
  const { data, error } = await supabase
    .from('sleep_entries')
    .select('*')
    .eq('userId', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Create mood entry
 */
export const createMoodEntry = async (entry: Partial<MoodEntry>): Promise<MoodEntry> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create energy entry
 */
export const createEnergyEntry = async (entry: Partial<EnergyEntry>): Promise<EnergyEntry> => {
  const { data, error } = await supabase
    .from('energy_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create sleep entry
 */
export const createSleepEntry = async (entry: Partial<SleepEntry>): Promise<SleepEntry> => {
  const { data, error } = await supabase
    .from('sleep_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
};
