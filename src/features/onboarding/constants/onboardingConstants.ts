/**
 * Onboarding Constants
 * 
 * Feature-specific constants for onboarding.
 */

export const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  FOCUS_SELECTION: 'focus_selection',
  PREFERENCE_SELECTION: 'preference_selection',
  DASHBOARD_PREVIEW: 'dashboard_preview',
  COMPLETE: 'complete',
} as const;

export const FOCUS_AREAS = {
  TASKS: 'tasks',
  HABITS: 'habits',
  MEALS: 'meals',
  WELLNESS: 'wellness',
  BUDGET: 'budget',
} as const;

export const PREFERENCES = {
  THEME: 'theme',
  NOTIFICATIONS: 'notifications',
  SOUND: 'sound',
  HAPTIC: 'haptic',
} as const;
