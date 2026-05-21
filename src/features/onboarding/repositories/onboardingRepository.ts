/**
 * Onboarding Repository
 * 
 * Repository pattern for onboarding data access.
 * Separates data access from business logic.
 */

import { supabase } from '@/services/api/supabase';

export interface OnboardingStatus {
  id: string;
  completed: boolean;
  currentStep: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingProgress {
  id: string;
  step: string;
  completedSteps: string[];
  focusAreas: string[];
  preferences: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch onboarding status for user
 */
export const fetchOnboardingStatus = async (userId: string): Promise<OnboardingStatus | null> => {
  const { data, error } = await supabase
    .from('onboarding_status')
    .select('*')
    .eq('userId', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Fetch onboarding progress for user
 */
export const fetchOnboardingProgress = async (userId: string): Promise<OnboardingProgress | null> => {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('userId', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create onboarding status
 */
export const createOnboardingStatus = async (status: Partial<OnboardingStatus>): Promise<OnboardingStatus> => {
  const { data, error } = await supabase
    .from('onboarding_status')
    .insert(status)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update onboarding status
 */
export const updateOnboardingStatus = async (id: string, updates: Partial<OnboardingStatus>): Promise<OnboardingStatus> => {
  const { data, error } = await supabase
    .from('onboarding_status')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create onboarding progress
 */
export const createOnboardingProgress = async (progress: Partial<OnboardingProgress>): Promise<OnboardingProgress> => {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .insert(progress)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update onboarding progress
 */
export const updateOnboardingProgress = async (id: string, updates: Partial<OnboardingProgress>): Promise<OnboardingProgress> => {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
