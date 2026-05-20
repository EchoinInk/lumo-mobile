/**
 * Onboarding Service
 * 
 * Service layer for onboarding logic and state management.
 * Handles onboarding flow, progress tracking, and completion.
 */

import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import type {
  StruggleArea,
  PlanningPreference,
  FocusArea,
  DashboardPersonalization,
} from '@/types/onboarding';
import { onboardingProgressHaptic, onboardingCompleteHaptic } from '@/animations/haptics';

/**
 * Set struggle areas from onboarding step 1
 */
export const setStruggleAreas = (areas: StruggleArea[]) => {
  useOnboardingStore.getState().setStruggleAreas(areas);
};

/**
 * Set planning preference from onboarding step 2
 */
export const setPlanningPreference = (preference: PlanningPreference) => {
  useOnboardingStore.getState().setPlanningPreference(preference);
  onboardingProgressHaptic();
};

/**
 * Set focus areas from onboarding step 3
 */
export const setFocusAreas = (areas: FocusArea[]) => {
  useOnboardingStore.getState().setFocusAreas(areas);
  onboardingProgressHaptic();
};

/**
 * Move to next onboarding step
 */
export const nextStep = () => {
  const { data } = useOnboardingStore.getState();
  const nextStepNumber = data.currentStep + 1;
  useOnboardingStore.getState().setCurrentStep(nextStepNumber);
};

/**
 * Move to previous onboarding step
 */
export const previousStep = () => {
  const { data } = useOnboardingStore.getState();
  const prevStepNumber = Math.max(1, data.currentStep - 1);
  useOnboardingStore.getState().setCurrentStep(prevStepNumber);
};

/**
 * Complete onboarding and generate dashboard personalization
 */
export const completeOnboarding = () => {
  const { data, personalization } = useOnboardingStore.getState();
  
  // Generate personalization based on onboarding choices
  const updatedPersonalization = generatePersonalization(
    data.focusAreas,
    data.planningPreference
  );
  
  // Update personalization
  useOnboardingStore.getState().updatePersonalization(updatedPersonalization);
  
  // Mark onboarding as complete
  useOnboardingStore.getState().completeOnboarding();
  
  // Update settings store
  useSettingsStore.getState().setOnboardingCompleted(true);
  
  // Trigger completion haptic
  onboardingCompleteHaptic();
};

/**
 * Generate dashboard personalization based on onboarding choices
 */
const generatePersonalization = (
  focusAreas: FocusArea[],
  planningPreference: PlanningPreference
): DashboardPersonalization => {
  // Set feature visibility based on focus areas
  const personalization: DashboardPersonalization = {
    showHabits: focusAreas.includes('habits'),
    showTasks: focusAreas.includes('tasks'),
    showMeals: focusAreas.includes('meals'),
    showWellness: focusAreas.includes('wellness'),
    showFitness: focusAreas.includes('fitness'),
    
    // Set dashboard density based on planning preference
    dashboardDensity: getDensityFromPreference(planningPreference),
    
    // Set card style based on planning preference
    cardStyle: getCardStyleFromPreference(planningPreference),
  };
  
  return personalization;
};

/**
 * Get dashboard density from planning preference
 */
const getDensityFromPreference = (
  preference: PlanningPreference
): DashboardPersonalization['dashboardDensity'] => {
  switch (preference) {
    case 'minimal':
      return 'minimal';
    case 'visual':
      return 'standard';
    case 'structured':
      return 'detailed';
    case 'flexible':
      return 'standard';
    default:
      return 'standard';
  }
};

/**
 * Get card style from planning preference
 */
const getCardStyleFromPreference = (
  preference: PlanningPreference
): DashboardPersonalization['cardStyle'] => {
  switch (preference) {
    case 'minimal':
      return 'compact';
    case 'visual':
      return 'spacious';
    case 'structured':
      return 'comfortable';
    case 'flexible':
      return 'comfortable';
    default:
      return 'comfortable';
  }
};

/**
 * Reset onboarding (for testing or re-onboarding)
 */
export const resetOnboarding = () => {
  useOnboardingStore.getState().resetOnboarding();
  useSettingsStore.getState().setOnboardingCompleted(false);
};

/**
 * Check if onboarding is completed
 */
export const isOnboardingCompleted = (): boolean => {
  return useSettingsStore.getState().settings.onboardingCompleted;
};

/**
 * Get current onboarding step
 */
export const getCurrentStep = (): number => {
  return useOnboardingStore.getState().data.currentStep;
};

/**
 * Get dashboard personalization
 */
export const getDashboardPersonalization = (): DashboardPersonalization => {
  return useOnboardingStore.getState().personalization;
};
