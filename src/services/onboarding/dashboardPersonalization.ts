/**
 * Dashboard Personalization Service
 * 
 * Service for applying onboarding choices to dashboard configuration.
 * Translates onboarding preferences into dashboard layout and feature settings.
 */

import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { DashboardPersonalization } from '@/types/onboarding';

/**
 * Get personalized dashboard configuration
 */
export const getPersonalizedDashboardConfig = (): DashboardPersonalization => {
  const { personalization } = useOnboardingStore.getState();
  return personalization;
};

/**
 * Check if a feature should be visible based on personalization
 */
export const isFeatureVisible = (feature: keyof DashboardPersonalization): boolean => {
  const { personalization } = useOnboardingStore.getState();
  return personalization[feature] as boolean;
};

/**
 * Get dashboard density setting
 */
export const getDashboardDensity = (): DashboardPersonalization['dashboardDensity'] => {
  const { personalization } = useOnboardingStore.getState();
  return personalization.dashboardDensity;
};

/**
 * Get card style setting
 */
export const getCardStyle = (): DashboardPersonalization['cardStyle'] => {
  const { personalization } = useOnboardingStore.getState();
  return personalization.cardStyle;
};

/**
 * Update dashboard personalization
 */
export const updateDashboardPersonalization = (
  updates: Partial<DashboardPersonalization>
) => {
  useOnboardingStore.getState().updatePersonalization(updates);
};

/**
 * Get visible features list
 */
export const getVisibleFeatures = (): string[] => {
  const { personalization } = useOnboardingStore.getState();
  
  const features: string[] = [];
  
  if (personalization.showHabits) features.push('habits');
  if (personalization.showTasks) features.push('tasks');
  if (personalization.showMeals) features.push('meals');
  if (personalization.showWellness) features.push('wellness');
  if (personalization.showFitness) features.push('fitness');
  
  return features;
};

/**
 * Get feature count
 */
export const getVisibleFeatureCount = (): number => {
  return getVisibleFeatures().length;
};
