/**
 * Accessibility Infrastructure Index
 * 
 * Central export for accessibility infrastructure.
 */

export { accessibilityManager, AccessibilityManager } from './accessibilityManager';
export { accessibilityConfig, defaultAccessibilityPreferences, defaultDynamicTextConfig } from './accessibilityConfig';
export {
  calculateContrastRatio,
  validateContrast,
  isAccessibleContrast,
  getRecommendedTextColor,
  type ContrastResult,
} from './colorContrast';
export {
  shouldRunAnimation,
  getAnimationDuration,
  scaleAnimationConfig,
  createAccessibleAnimationConfig,
} from './reducedMotion';
export { focusModeManager, FocusModeManager } from './focusModeManager';
export { simplifiedModeManager, SimplifiedModeManager, type SimplifiedModeConfig } from './simplifiedMode';
