/**
 * Onboarding Helpers
 * 
 * Utility functions for onboarding logic.
 */

import type { DashboardPersonalization } from '@/types/onboarding';

/**
 * Calculate default dashboard layout based on personalization
 */
export const getDefaultDashboardLayout = (
  personalization: DashboardPersonalization
): string[] => {
  const layout: string[] = [];

  if (personalization.showTasks) layout.push('tasks');
  if (personalization.showHabits) layout.push('habits');
  if (personalization.showMeals) layout.push('meals');
  if (personalization.showWellness) layout.push('wellness');
  if (personalization.showFitness) layout.push('fitness');

  return layout;
};

/**
 * Get recommended features based on struggle areas
 */
export const getRecommendedFeatures = (struggleAreas: string[]): string[] => {
  const recommendations: string[] = [];

  if (struggleAreas.includes('rememberingTasks')) {
    recommendations.push('tasks', 'habits');
  }
  if (struggleAreas.includes('routines')) {
    recommendations.push('habits');
  }
  if (struggleAreas.includes('mealPlanning')) {
    recommendations.push('meals');
  }
  if (struggleAreas.includes('overwhelm')) {
    recommendations.push('tasks', 'wellness');
  }
  if (struggleAreas.includes('budgeting')) {
    recommendations.push('tasks');
  }
  if (struggleAreas.includes('consistency')) {
    recommendations.push('habits', 'tasks');
  }

  // Remove duplicates
  return [...new Set(recommendations)];
};

/**
 * Validate onboarding data completeness
 */
export const validateOnboardingData = (data: {
  struggleAreas: string[];
  planningPreference: string;
  focusAreas: string[];
}): boolean => {
  // Struggle areas are optional
  // Planning preference is required
  // Focus areas are required
  return (
    data.planningPreference.length > 0 &&
    data.focusAreas.length > 0
  );
};
