/**
 * Cognitive Load Rules
 *
 * Maps density preferences to UI rules for cognitive load reduction.
 * Reusable by Dashboard, Tasks, Calendar, and future features.
 */

import type { CognitiveDensity, CognitiveLoadProfile, FocusSectionKey } from "../types/focus.types";

/**
 * Get cognitive load profile based on density preference.
 */
export function getCognitiveLoadProfile(density: CognitiveDensity): CognitiveLoadProfile {
  switch (density) {
    case "minimal":
      return {
        density: "minimal",
        showSecondaryActions: false,
        showDecorativeElements: false,
        maxVisibleCards: 2,
        preferSinglePrimaryAction: true,
        reduceMotion: true,
      };
    case "comfortable":
      return {
        density: "comfortable",
        showSecondaryActions: true,
        showDecorativeElements: true,
        maxVisibleCards: 4,
        preferSinglePrimaryAction: false,
        reduceMotion: false,
      };
    case "standard":
    default:
      return {
        density: "standard",
        showSecondaryActions: true,
        showDecorativeElements: true,
        maxVisibleCards: 8,
        preferSinglePrimaryAction: false,
        reduceMotion: false,
      };
  }
}

/**
 * Determine if a section should be visible based on density and hidden sections.
 */
export function shouldShowSection(
  sectionKey: FocusSectionKey,
  density: CognitiveDensity,
  hiddenSections: FocusSectionKey[]
): boolean {
  // If explicitly hidden, don't show
  if (hiddenSections.includes(sectionKey)) {
    return false;
  }

  // Density-based visibility rules
  switch (density) {
    case "minimal":
      // In minimal mode, only show essential sections
      const essentialSections: FocusSectionKey[] = ["today"];
      return essentialSections.includes(sectionKey);
    case "comfortable":
      // In comfortable mode, show most sections but hide suggestions
      const hiddenInComfortable: FocusSectionKey[] = ["suggestions"];
      return !hiddenInComfortable.includes(sectionKey);
    case "standard":
    default:
      // Standard mode shows everything
      return true;
  }
}

/**
 * Get the maximum number of items to display in a list/card group.
 */
export function getMaxVisibleItems(density: CognitiveDensity, defaultMax: number): number {
  const profile = getCognitiveLoadProfile(density);
  return Math.min(profile.maxVisibleCards, defaultMax);
}

/**
 * Check if secondary actions should be shown.
 */
export function shouldShowSecondaryActions(density: CognitiveDensity): boolean {
  const profile = getCognitiveLoadProfile(density);
  return profile.showSecondaryActions;
}

/**
 * Check if decorative elements should be shown.
 */
export function shouldShowDecorativeElements(density: CognitiveDensity): boolean {
  const profile = getCognitiveLoadProfile(density);
  return profile.showDecorativeElements;
}

/**
 * Check if motion should be reduced.
 */
export function shouldReduceMotion(density: CognitiveDensity): boolean {
  const profile = getCognitiveLoadProfile(density);
  return profile.reduceMotion;
}

/**
 * Check if single primary action mode is preferred.
 */
export function shouldPreferSinglePrimaryAction(density: CognitiveDensity): boolean {
  const profile = getCognitiveLoadProfile(density);
  return profile.preferSinglePrimaryAction;
}
