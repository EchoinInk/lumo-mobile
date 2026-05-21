/**
 * Accessibility Configuration
 * 
 * Centralized accessibility configuration and defaults.
 */

import type { AccessibilityPreferences, DynamicTextConfig } from '@/types/accessibility';
import { ACCESSIBILITY_CONSTANTS } from '@/constants/accessibility';

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  // Motion preferences
  reducedMotion: false,
  motionIntensity: 'normal',
  
  // Haptic preferences
  hapticFeedbackEnabled: true,
  hapticIntensity: 'normal',
  
  // Visual preferences
  highContrast: false,
  largeText: false,
  
  // Animation priorities
  preserveFocusAnimations: true,
  preserveOrientationAnimations: false,
  preserveStateAnimations: true,
  preserveDelightAnimations: false,
  
  // Simplified mode
  simplifiedMode: false,
  
  // Cognitive load adaptation
  adaptiveComplexity: true,
};

export const defaultDynamicTextConfig: DynamicTextConfig = {
  scale: 'medium',
  adaptiveSpacing: true,
  preserveLayout: true,
};

export const accessibilityConfig = {
  preferences: defaultAccessibilityPreferences,
  dynamicText: defaultDynamicTextConfig,
  constants: ACCESSIBILITY_CONSTANTS,
  
  // Helper to get font scale multiplier
  getFontScaleMultiplier: (scale: string): number => {
    return ACCESSIBILITY_CONSTANTS.FONT_SCALES[scale as keyof typeof ACCESSIBILITY_CONSTANTS.FONT_SCALES] || 1;
  },
  
  // Helper to check if motion should be reduced
  shouldReduceMotion: (preferences: AccessibilityPreferences): boolean => {
    return preferences.reducedMotion || preferences.motionIntensity === 'none';
  },
  
  // Helper to get haptic intensity value
  getHapticIntensity: (intensity: string): number => {
    return ACCESSIBILITY_CONSTANTS.HAPTIC_INTENSITY[intensity as keyof typeof ACCESSIBILITY_CONSTANTS.HAPTIC_INTENSITY] || 20;
  },
};
