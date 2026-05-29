/**
 * useCognitiveLoad Hook
 *
 * Hook for cognitive load reduction rules.
 * Screens should consume this hook to get UI density and visibility rules.
 */

import { useCallback } from "react";
import {
    getMaxVisibleItems,
    shouldPreferSinglePrimaryAction,
    shouldReduceMotion,
    shouldShowDecorativeElements,
    shouldShowSecondaryActions,
    shouldShowSection,
} from "../services/cognitiveLoadRules";
import type { FocusSectionKey } from "../types/focus.types";
import { useFocusMode } from "./useFocusMode";

export function useCognitiveLoad() {
  const {
    isFocusModeEnabled,
    densityPreference,
    hiddenSections,
    cognitiveLoadProfile,
  } = useFocusMode();

  // Memoized section visibility checker
  const checkSectionVisibility = useCallback(
    (sectionKey: FocusSectionKey): boolean => {
      return shouldShowSection(sectionKey, densityPreference, hiddenSections);
    },
    [densityPreference, hiddenSections],
  );

  // Memoized max visible items calculator
  const calculateMaxVisibleItems = useCallback(
    (defaultMax: number): number => {
      return getMaxVisibleItems(densityPreference, defaultMax);
    },
    [densityPreference],
  );

  return {
    // Current density setting
    density: densityPreference,

    // Full cognitive load profile
    cognitiveLoadProfile,

    // Helper functions
    shouldShowSection: checkSectionVisibility,
    shouldShowSecondaryActions: shouldShowSecondaryActions(densityPreference),
    shouldShowDecorativeElements:
      shouldShowDecorativeElements(densityPreference),
    shouldShowMetadata: shouldShowDecorativeElements(densityPreference),
    shouldReduceMotion: shouldReduceMotion(densityPreference),
    shouldPreferSinglePrimaryAction:
      shouldPreferSinglePrimaryAction(densityPreference),
    maxVisibleCards: cognitiveLoadProfile.maxVisibleCards,
    getMaxVisibleItems: calculateMaxVisibleItems,

    // Focus mode state for reference
    isFocusModeEnabled,
  };
}
