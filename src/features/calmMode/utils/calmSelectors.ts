/**
 * Calm Mode Selectors
 *
 * Selector utilities for Calm Mode state.
 * These provide efficient memoized access to calm mode state.
 */

import { useCalmModeStore } from '../store/useCalmModeStore';

/**
 * Select whether calm mode is enabled.
 */
export const selectIsCalmModeEnabled = () => useCalmModeStore((state) => state.isCalmModeEnabled);

/**
 * Select the current environmental intensity.
 */
export const selectEnvironmentalIntensity = () => useCalmModeStore((state) => state.environmentalIntensity);

/**
 * Select whether reduced motion is enabled.
 */
export const selectReducedMotionEnabled = () => useCalmModeStore((state) => state.reducedMotionEnabled);

/**
 * Select whether softened gradients are enabled.
 */
export const selectSoftenedGradientsEnabled = () => useCalmModeStore((state) => state.softenedGradientsEnabled);

/**
 * Select whether decorative elements are reduced.
 */
export const selectReducedDecorativeElements = () => useCalmModeStore((state) => state.reducedDecorativeElements);

/**
 * Select whether reduced contrast mode is enabled.
 */
export const selectReducedContrastMode = () => useCalmModeStore((state) => state.reducedContrastMode);

/**
 * Select the last enabled timestamp.
 */
export const selectLastEnabledAt = () => useCalmModeStore((state) => state.lastEnabledAt);
