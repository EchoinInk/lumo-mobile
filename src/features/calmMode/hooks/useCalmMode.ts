/**
 * useCalmMode Hook
 *
 * Hook for managing Calm Mode state.
 * Screens should consume hooks only, not the store directly.
 */

import { useCallback } from 'react';
import { useCalmModeStore } from '../store/useCalmModeStore';
import { isFeatureEnabled } from '@/src/config/features/featureFlags';
import { observability } from '@/src/services/observability';

export function useCalmMode() {
  const calmModeEnabled = isFeatureEnabled('calmModeV2');

  const {
    isCalmModeEnabled,
    reducedMotionEnabled,
    softenedGradientsEnabled,
    reducedDecorativeElements,
    reducedContrastMode,
    environmentalIntensity,
    lastEnabledAt,
    enableCalmMode: storeEnableCalmMode,
    disableCalmMode: storeDisableCalmMode,
    setReducedMotionEnabled: storeSetReducedMotionEnabled,
    setSoftenedGradientsEnabled: storeSetSoftenedGradientsEnabled,
    setReducedDecorativeElements: storeSetReducedDecorativeElements,
    setReducedContrastMode: storeSetReducedContrastMode,
    setEnvironmentalIntensity: storeSetEnvironmentalIntensity,
  } = useCalmModeStore();

  const enableCalmMode = useCallback(() => {
    if (calmModeEnabled) {
      storeEnableCalmMode();
      observability.analytics.track('calm_mode_enabled');
    }
  }, [calmModeEnabled, storeEnableCalmMode]);

  const disableCalmMode = useCallback(() => {
    if (calmModeEnabled) {
      storeDisableCalmMode();
      observability.analytics.track('calm_mode_disabled');
    }
  }, [calmModeEnabled, storeDisableCalmMode]);

  const setReducedMotionEnabled = useCallback(
    (value: boolean) => {
      if (calmModeEnabled) {
        storeSetReducedMotionEnabled(value);
      }
    },
    [calmModeEnabled, storeSetReducedMotionEnabled]
  );

  const setSoftenedGradientsEnabled = useCallback(
    (value: boolean) => {
      if (calmModeEnabled) {
        storeSetSoftenedGradientsEnabled(value);
      }
    },
    [calmModeEnabled, storeSetSoftenedGradientsEnabled]
  );

  const setReducedDecorativeElements = useCallback(
    (value: boolean) => {
      if (calmModeEnabled) {
        storeSetReducedDecorativeElements(value);
      }
    },
    [calmModeEnabled, storeSetReducedDecorativeElements]
  );

  const setReducedContrastMode = useCallback(
    (value: boolean) => {
      if (calmModeEnabled) {
        storeSetReducedContrastMode(value);
      }
    },
    [calmModeEnabled, storeSetReducedContrastMode]
  );

  const setEnvironmentalIntensity = useCallback(
    (intensity: 'soft' | 'balanced' | 'cinematic') => {
      if (calmModeEnabled) {
        storeSetEnvironmentalIntensity(intensity);
      }
    },
    [calmModeEnabled, storeSetEnvironmentalIntensity]
  );

  return {
    // Feature flag guard
    isFeatureEnabled: calmModeEnabled,

    // State
    isCalmModeEnabled: calmModeEnabled ? isCalmModeEnabled : false,
    reducedMotionEnabled,
    softenedGradientsEnabled,
    reducedDecorativeElements,
    reducedContrastMode,
    environmentalIntensity,
    lastEnabledAt,

    // Actions
    enableCalmMode,
    disableCalmMode,
    setReducedMotionEnabled,
    setSoftenedGradientsEnabled,
    setReducedDecorativeElements,
    setReducedContrastMode,
    setEnvironmentalIntensity,
  };
}
