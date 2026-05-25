/**
 * Onboarding Feature Exports
 * Phase 11.9 - Onboarding Foundation
 */

// Types
export type {
  StruggleArea,
  PlanningStyle,
  FocusArea,
  OnboardingPreferences,
  OnboardingState,
  OnboardingStore,
} from "./types/onboarding";

export {
  STRUGGLE_AREA_LABELS,
  PLANNING_STYLE_LABELS,
  FOCUS_AREA_LABELS,
} from "./types/onboarding";

// Store
export { useOnboardingStore } from "./store/useOnboardingStore";

// Hook
export { useOnboarding } from "./hooks/useOnboarding";

// Components
export { OnboardingShell } from "./components/OnboardingShell";
export { ChoiceChip } from "./components/ChoiceChip";
export { OnboardingProgress } from "./components/OnboardingProgress";
