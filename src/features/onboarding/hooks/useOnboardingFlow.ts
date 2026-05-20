/**
 * useOnboardingFlow Hook
 * 
 * Custom hook for managing onboarding flow logic.
 * Provides state and actions for onboarding navigation.
 */

import { useOnboardingStore } from '@/store/useOnboardingStore';
import {
  setStruggleAreas,
  setPlanningPreference,
  setFocusAreas,
  nextStep,
  previousStep,
  completeOnboarding,
} from '@/services/onboarding/onboardingService';
import type { StruggleArea, PlanningPreference, FocusArea } from '@/types/onboarding';

export const useOnboardingFlow = () => {
  const { data, personalization } = useOnboardingStore();

  const handleSetStruggleAreas = (areas: StruggleArea[]) => {
    setStruggleAreas(areas);
  };

  const handleSetPlanningPreference = (preference: PlanningPreference) => {
    setPlanningPreference(preference);
    nextStep();
  };

  const handleSetFocusAreas = (areas: FocusArea[]) => {
    setFocusAreas(areas);
    completeOnboarding();
  };

  const handleNextStep = () => {
    nextStep();
  };

  const handlePreviousStep = () => {
    previousStep();
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return {
    // State
    currentStep: data.currentStep,
    struggleAreas: data.struggleAreas,
    planningPreference: data.planningPreference,
    focusAreas: data.focusAreas,
    personalization,
    isCompleted: !!data.completedAt,

    // Actions
    setStruggleAreas: handleSetStruggleAreas,
    setPlanningPreference: handleSetPlanningPreference,
    setFocusAreas: handleSetFocusAreas,
    nextStep: handleNextStep,
    previousStep: handlePreviousStep,
    completeOnboarding: handleComplete,
  };
};
