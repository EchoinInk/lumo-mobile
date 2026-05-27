/**
 * Focus Selectors
 *
 * Selector utilities for Focus Mode state.
 * Provides memoized selectors for common state queries.
 */

import { useFocusModeStore } from '../store/useFocusModeStore';

/**
 * Select whether Focus Mode is enabled.
 */
export const selectIsFocusModeEnabled = (state: ReturnType<typeof useFocusModeStore.getState>) =>
  state.isFocusModeEnabled;

/**
 * Select the active focus task ID.
 */
export const selectActiveFocusTaskId = (state: ReturnType<typeof useFocusModeStore.getState>) =>
  state.activeFocusTaskId;

/**
 * Select the density preference.
 */
export const selectDensityPreference = (state: ReturnType<typeof useFocusModeStore.getState>) =>
  state.densityPreference;

/**
 * Select hidden sections.
 */
export const selectHiddenSections = (state: ReturnType<typeof useFocusModeStore.getState>) =>
  state.hiddenSections;

/**
 * Select whether reduced stimulus is enabled.
 */
export const selectReducedStimulusEnabled = (state: ReturnType<typeof useFocusModeStore.getState>) =>
  state.reducedStimulusEnabled;

/**
 * Select the last enabled timestamp.
 */
export const selectLastEnabledAt = (state: ReturnType<typeof useFocusModeStore.getState>) =>
  state.lastEnabledAt;

/**
 * Select whether a specific section is hidden.
 */
export const selectIsSectionHidden = (
  state: ReturnType<typeof useFocusModeStore.getState>,
  sectionKey: string
) => state.hiddenSections.includes(sectionKey as any);
