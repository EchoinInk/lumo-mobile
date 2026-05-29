/**
 * Calm Mode Feature
 *
 * Environmental softening layer for reducing sensory load,
 * visual intensity, and environmental stimulation.
 */

// Components
export { CalmModeBanner } from './components/CalmModeBanner';
export { SoftenedSurface } from './components/SoftenedSurface';
export { ReducedMotionWrapper } from './components/ReducedMotionWrapper';
export { CalmGradientOverlay } from './components/CalmGradientOverlay';

// Hooks
export { useCalmMode } from './hooks/useCalmMode';
export { useEnvironmentalSoftening } from './hooks/useEnvironmentalSoftening';

// Services
export { getEnvironmentalProfile, getRecommendedIntensity, getAnimationDurationMultiplier, getGlowOpacityMultiplier, getGradientContrastMultiplier } from './services/environmentalRules';
export { validateIntensity, calculateCalmSessionDuration, formatCalmDuration } from './services/calmModeService';

// Store
export { useCalmModeStore } from './store/useCalmModeStore';

// Types
export type { EnvironmentalIntensity, EnvironmentalSofteningProfile, CalmModeState } from './types/calmMode.types';

// Utils
export { selectIsCalmModeEnabled, selectEnvironmentalIntensity, selectReducedMotionEnabled, selectSoftenedGradientsEnabled, selectReducedDecorativeElements, selectReducedContrastMode, selectLastEnabledAt } from './utils/calmSelectors';
