/**
 * Accessibility Constants
 * 
 * Constants for accessibility preferences and configurations.
 */

export const ACCESSIBILITY_CONSTANTS = {
  // Font scale mappings
  FONT_SCALES: {
    small: 0.875,
    medium: 1,
    large: 1.125,
    'extra-large': 1.25,
    'extra-extra-large': 1.5,
  } as const,

  // Minimum touch targets
  MIN_TOUCH_TARGET: 44,

  // Contrast ratios (WCAG AA)
  MIN_CONTRAST_RATIO: 4.5,
  HIGH_CONTRAST_RATIO: 7,

  // Motion duration limits
  MIN_MOTION_DURATION: 150,
  MAX_MOTION_DURATION: 500,
  REDUCED_MOTION_DURATION: 200,

  // Haptic intensity levels
  HAPTIC_INTENSITY: {
    light: 10,
    normal: 20,
    strong: 40,
  } as const,

  // Simplified mode density limits
  SIMPLIFIED_MODE: {
    MAX_VISIBLE_CARDS: 3,
    MAX_VISIBLE_ACTIONS: 2,
    REDUCED_SPACING: 0.8,
  } as const,

  // Cognitive load thresholds
  COGNITIVE_LOAD: {
    LOW_MAX_ACTIONS: 8,
    MEDIUM_MAX_ACTIONS: 5,
    HIGH_MAX_ACTIONS: 3,
    OVERWHELMED_MAX_ACTIONS: 1,
  } as const,
} as const;
