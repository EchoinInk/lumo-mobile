/**
 * useFocusMode Hook
 *
 * Hook for managing Focus Mode state.
 * Screens should consume hooks only, not the store directly.
 */

import { useCallback } from 'react';
import { useFocusModeStore } from '../store/useFocusModeStore';
import { getCognitiveLoadProfile } from '../services/cognitiveLoadRules';
import { isFeatureEnabled } from '@/src/config/features/featureFlags';
import { observability } from '@/src/services/observability';

export function useFocusMode() {
  const focusModeEnabled = isFeatureEnabled('focusMode');

  const {
    isFocusModeEnabled,
    activeFocusTaskId,
    hiddenSections,
    densityPreference,
    reducedStimulusEnabled,
    lastEnabledAt,
    enableFocusMode: storeEnableFocusMode,
    disableFocusMode: storeDisableFocusMode,
    setActiveFocusTask: storeSetActiveFocusTask,
    toggleSectionVisibility: storeToggleSectionVisibility,
    setDensityPreference: storeSetDensityPreference,
    setReducedStimulusEnabled: storeSetReducedStimulusEnabled,
  } = useFocusModeStore();

  const enableFocusMode = useCallback(
    (taskId?: string) => {
      if (focusModeEnabled) {
        storeEnableFocusMode(taskId);
        observability.analytics.track('focus_mode_enabled', {
          hasActiveTask: Boolean(taskId),
        });
      }
    },
    [focusModeEnabled, storeEnableFocusMode]
  );

  const disableFocusMode = useCallback(() => {
    if (focusModeEnabled) {
      storeDisableFocusMode();
      observability.analytics.track('focus_mode_disabled');
    }
  }, [focusModeEnabled, storeDisableFocusMode]);

  const setActiveFocusTask = useCallback(
    (taskId: string | null) => {
      if (focusModeEnabled) {
        storeSetActiveFocusTask(taskId);
      }
    },
    [focusModeEnabled, storeSetActiveFocusTask]
  );

  const toggleSectionVisibility = useCallback(
    (sectionKey: string) => {
      if (focusModeEnabled) {
        storeToggleSectionVisibility(sectionKey as any);
      }
    },
    [focusModeEnabled, storeToggleSectionVisibility]
  );

  const setDensityPreference = useCallback(
    (preference: 'minimal' | 'comfortable' | 'standard') => {
      if (focusModeEnabled) {
        storeSetDensityPreference(preference);
      }
    },
    [focusModeEnabled, storeSetDensityPreference]
  );

  const setReducedStimulusEnabled = useCallback(
    (value: boolean) => {
      if (focusModeEnabled) {
        storeSetReducedStimulusEnabled(value);
      }
    },
    [focusModeEnabled, storeSetReducedStimulusEnabled]
  );

  // Get cognitive load profile based on current density preference
  const cognitiveLoadProfile = getCognitiveLoadProfile(densityPreference);

  return {
    // Feature flag guard
    isFeatureEnabled: focusModeEnabled,

    // State
    isFocusModeEnabled: focusModeEnabled ? isFocusModeEnabled : false,
    activeFocusTaskId,
    hiddenSections,
    densityPreference,
    reducedStimulusEnabled,
    lastEnabledAt,

    // Computed
    cognitiveLoadProfile,

    // Actions
    enableFocusMode,
    disableFocusMode,
    setActiveFocusTask,
    toggleSectionVisibility,
    setDensityPreference,
    setReducedStimulusEnabled,
  };
}
