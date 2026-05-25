/**
 * Onboarding Hook
 * Phase 11.9 - Onboarding Foundation
 */

import { useEffect } from "react";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { FocusArea, PlanningStyle, StruggleArea } from "../types/onboarding";

export function useOnboarding() {
  const store = useOnboardingStore();

  // Hydrate on mount
  useEffect(() => {
    if (!store.isHydrated) {
      store.hydrate();
    }
  }, [store.isHydrated]);

  return {
    // State
    isHydrated: store.isHydrated,
    isComplete: store.isComplete,
    preferences: store.preferences,

    // Actions
    setStruggleAreas: (values: StruggleArea[]) => store.setStruggleAreas(values),
    setPlanningStyle: (value: PlanningStyle) => store.setPlanningStyle(value),
    setFocusAreas: (values: FocusArea[]) => store.setFocusAreas(values),
    completeOnboarding: () => store.completeOnboarding(),
    resetOnboarding: () => store.resetOnboarding(),
  };
}
