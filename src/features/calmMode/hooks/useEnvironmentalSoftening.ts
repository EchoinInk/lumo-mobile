/**
 * useEnvironmentalSoftening Hook
 *
 * Hook for accessing environmental softening profile.
 * Screens/components should consume this hook to get softening rules.
 */

import { useMemo } from 'react';
import { useCalmModeStore } from '../store/useCalmModeStore';
import { getEnvironmentalProfile } from '../services/environmentalRules';
import { isFeatureEnabled } from '@/src/config/features/featureFlags';

export function useEnvironmentalSoftening() {
  const calmModeEnabled = isFeatureEnabled('calmModeV2');

  const {
    isCalmModeEnabled,
    reducedMotionEnabled,
    softenedGradientsEnabled,
    reducedDecorativeElements,
    reducedContrastMode,
    environmentalIntensity,
  } = useCalmModeStore();

  // Get environmental profile based on current intensity
  const environmentalProfile = useMemo(() => {
    if (!calmModeEnabled || !isCalmModeEnabled) {
      // Return default profile when calm mode is disabled
      return getEnvironmentalProfile('cinematic');
    }

    return getEnvironmentalProfile(environmentalIntensity);
  }, [calmModeEnabled, isCalmModeEnabled, environmentalIntensity]);

  // Computed flags for easy consumption
  const shouldReduceMotion = calmModeEnabled && isCalmModeEnabled && (reducedMotionEnabled || environmentalProfile.reduceMotion);
  const shouldReduceGlowIntensity = calmModeEnabled && isCalmModeEnabled && environmentalProfile.reduceGlowIntensity;
  const shouldReduceDecorativeElements = calmModeEnabled && isCalmModeEnabled && (reducedDecorativeElements || environmentalProfile.reduceDecorativeElements);
  const shouldReduceGradientContrast = calmModeEnabled && isCalmModeEnabled && (softenedGradientsEnabled || environmentalProfile.reduceGradientContrast);
  const shouldSimplifyAtmospheres = calmModeEnabled && isCalmModeEnabled && environmentalProfile.simplifyAtmospheres;
  const shouldLowerVisualNoise = calmModeEnabled && isCalmModeEnabled && environmentalProfile.lowerVisualNoise;
  const shouldSoftenSurfaceBorders = calmModeEnabled && isCalmModeEnabled && environmentalProfile.softenSurfaceBorders;

  return {
    // Feature flag guard
    isFeatureEnabled: calmModeEnabled,

    // State
    isCalmModeEnabled: calmModeEnabled ? isCalmModeEnabled : false,

    // Computed flags
    shouldReduceMotion,
    shouldReduceGlowIntensity,
    shouldReduceDecorativeElements,
    shouldReduceGradientContrast,
    shouldSimplifyAtmospheres,
    shouldLowerVisualNoise,
    shouldSoftenSurfaceBorders,

    // Full profile
    environmentalProfile,
  };
}
