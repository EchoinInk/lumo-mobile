/**
 * Focus Mode Feature
 *
 * Cognitive load reduction layer for Lumo.
 * Provides reusable focus mode and cognitive load control for screens.
 *
 * Architecture:
 * Screen → Hook → Feature Store/Service → Persistence
 *
 * Usage:
 * import { useFocusMode, useCognitiveLoad } from '@/src/features/focus';
 */

// Components
export { FocusModeBanner } from './components/FocusModeBanner';
export { FocusTaskCard } from './components/FocusTaskCard';
export { FocusExitButton } from './components/FocusExitButton';
export { FocusEmptyState } from './components/FocusEmptyState';

// Hooks
export { useFocusMode } from './hooks/useFocusMode';
export { useCognitiveLoad } from './hooks/useCognitiveLoad';

// Services
export { getCognitiveLoadProfile, shouldShowSection, shouldShowSecondaryActions, shouldShowDecorativeElements, shouldReduceMotion, shouldPreferSinglePrimaryAction, getMaxVisibleItems } from './services/cognitiveLoadRules';
export { getRecommendedDensity, validateTaskId, calculateFocusSessionDuration, formatFocusDuration } from './services/focusModeService';

// Store
export { useFocusModeStore } from './store/useFocusModeStore';

// Types
export type { CognitiveDensity, CognitiveLoadProfile, FocusModeState, FocusSectionKey } from './types/focus.types';

// Utils
export {
  selectIsFocusModeEnabled,
  selectActiveFocusTaskId,
  selectDensityPreference,
  selectHiddenSections,
  selectReducedStimulusEnabled,
  selectLastEnabledAt,
  selectIsSectionHidden,
} from './utils/focusSelectors';
