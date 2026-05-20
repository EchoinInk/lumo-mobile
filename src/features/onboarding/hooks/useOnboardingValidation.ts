/**
 * useOnboardingValidation Hook
 * 
 * Validation logic for onboarding steps.
 * Ensures users provide required information before proceeding.
 */

import type { StruggleArea, FocusArea } from '@/types/onboarding';

export const useOnboardingValidation = () => {
  const validateStruggleAreas = (areas: StruggleArea[]): boolean => {
    // Allow empty selection - this is optional
    return true;
  };

  const validatePlanningPreference = (preference: string): boolean => {
    // Planning preference is required
    return preference.length > 0;
  };

  const validateFocusAreas = (areas: FocusArea[]): boolean => {
    // At least one focus area should be selected
    return areas.length > 0;
  };

  const canProceedFromStep = (step: number, data: any): boolean => {
    switch (step) {
      case 1:
        return validateStruggleAreas(data.struggleAreas);
      case 2:
        return validatePlanningPreference(data.planningPreference);
      case 3:
        return validateFocusAreas(data.focusAreas);
      default:
        return true;
    }
  };

  return {
    validateStruggleAreas,
    validatePlanningPreference,
    validateFocusAreas,
    canProceedFromStep,
  };
};
