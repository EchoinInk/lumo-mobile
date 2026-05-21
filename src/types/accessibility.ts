/**
 * Accessibility Type Definitions
 *
 * Type definitions for accessibility preferences and motion settings.
 */

export interface AccessibilityPreferences {
  // Motion preferences
  reducedMotion: boolean;
  motionIntensity: "none" | "reduced" | "normal";

  // Haptic preferences
  hapticFeedbackEnabled: boolean;
  hapticIntensity: "light" | "normal" | "strong";

  // Visual preferences
  highContrast: boolean;
  largeText: boolean;

  // Animation priorities
  preserveFocusAnimations: boolean;
  preserveOrientationAnimations: boolean;
  preserveStateAnimations: boolean;
  preserveDelightAnimations: boolean;

  // Simplified mode
  simplifiedMode: boolean;

  // Cognitive load adaptation
  adaptiveComplexity: boolean;
}

export interface HapticPattern {
  type: "impact" | "notification" | "selection";
  style?: "light" | "medium" | "heavy" | "success" | "warning" | "error";
  duration?: number;
}

export type AnimationPriority = "essential" | "optional";

export interface AnimationConfig {
  priority: AnimationPriority;
  reducedMotionBehavior: "skip" | "simplify" | "preserve";
  duration: number;
  easing: string | number[];
}

// Dynamic font scaling
export type FontScale =
  | "small"
  | "medium"
  | "large"
  | "extra-large"
  | "extra-extra-large";

export interface DynamicTextConfig {
  scale: FontScale;
  adaptiveSpacing: boolean;
  preserveLayout: boolean;
}

// Cognitive load
export type CognitiveLoadLevel = "low" | "medium" | "high" | "overwhelmed";

export interface CognitiveLoadState {
  level: CognitiveLoadLevel;
  visibleActionCount: number;
  dashboardDensity: "minimal" | "normal" | "dense";
}
