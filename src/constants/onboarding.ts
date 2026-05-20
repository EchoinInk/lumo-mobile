/**
 * Onboarding Constants
 * 
 * Constants for the onboarding system.
 * Centralized configuration for onboarding flow and options.
 */

import type { StruggleArea, PlanningPreference, FocusArea } from '@/types/onboarding';

/**
 * Onboarding step definitions
 */
export const ONBOARDING_TOTAL_STEPS = 3;

/**
 * Struggle area options for step 1
 */
export const STRUGGLE_AREA_OPTIONS: Array<{
  id: StruggleArea;
  label: string;
  description?: string;
}> = [
  { id: 'rememberingTasks', label: 'Remembering tasks' },
  { id: 'routines', label: 'Routines' },
  { id: 'mealPlanning', label: 'Meal planning' },
  { id: 'overwhelm', label: 'Overwhelm' },
  { id: 'budgeting', label: 'Budgeting' },
  { id: 'consistency', label: 'Consistency' },
];

/**
 * Planning preference options for step 2
 */
export const PLANNING_PREFERENCE_OPTIONS: Array<{
  id: PlanningPreference;
  label: string;
  description: string;
}> = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Simple, focused lists',
  },
  {
    id: 'visual',
    label: 'Visual',
    description: 'Cards and visual cues',
  },
  {
    id: 'structured',
    label: 'Structured',
    description: 'Organized categories',
  },
  {
    id: 'flexible',
    label: 'Flexible',
    description: 'Adaptable and freeform',
  },
];

/**
 * Focus area options for step 3
 */
export const FOCUS_AREA_OPTIONS: Array<{
  id: FocusArea;
  label: string;
  description?: string;
}> = [
  { id: 'habits', label: 'Habits' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'meals', label: 'Meals' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'fitness', label: 'Fitness' },
];

/**
 * Minimum focus areas required
 */
export const MIN_FOCUS_AREAS = 1;

/**
 * Maximum focus areas allowed
 */
export const MAX_FOCUS_AREAS = 5;

/**
 * Onboarding completion timeout (ms)
 * Used for analytics and tracking
 */
export const ONBOARDING_COMPLETION_TIMEOUT = 30000;

/**
 * Default personalization settings
 */
export const DEFAULT_PERSONALIZATION = {
  showHabits: true,
  showTasks: true,
  showMeals: false,
  showWellness: false,
  showFitness: false,
  dashboardDensity: 'standard' as const,
  cardStyle: 'comfortable' as const,
};

/**
 * Dashboard density options
 */
export const DASHBOARD_DENSITY_OPTIONS = ['minimal', 'standard', 'detailed'] as const;

/**
 * Card style options
 */
export const CARD_STYLE_OPTIONS = ['compact', 'comfortable', 'spacious'] as const;
