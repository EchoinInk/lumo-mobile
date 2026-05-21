/**
 * Habit Constants
 * 
 * Feature-specific constants for habits.
 */

export const HABIT_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export const HABIT_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

export const HABIT_CATEGORIES = {
  HEALTH: 'health',
  PRODUCTIVITY: 'productivity',
  MINDFULNESS: 'mindfulness',
  SOCIAL: 'social',
  OTHER: 'other',
} as const;
