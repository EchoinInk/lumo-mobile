/**
 * Onboarding Selectors
 * 
 * Derived state selectors for onboarding.
 * Memoized for performance.
 */

/**
 * Select current step
 */
export const selectCurrentStep = (progress: any) => {
  return progress?.step || 'welcome';
};

/**
 * Select completed steps
 */
export const selectCompletedSteps = (progress: any) => {
  return progress?.completedSteps || [];
};

/**
 * Select next step
 */
export const selectNextStep = (progress: any) => {
  const steps = ['welcome', 'focus_selection', 'preference_selection', 'dashboard_preview'];
  const currentIndex = steps.indexOf(progress?.step);
  if (currentIndex === -1 || currentIndex === steps.length - 1) {
    return null;
  }
  return steps[currentIndex + 1];
};

/**
 * Select is completed
 */
export const selectIsCompleted = (status: any) => {
  return status?.completed || false;
};
