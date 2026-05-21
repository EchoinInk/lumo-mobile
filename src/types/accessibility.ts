/**
 * Accessibility Type Definitions
 * 
 * Type definitions for accessibility preferences and motion settings.
 */

export interface AccessibilityPreferences {
  // Motion preferences
  reducedMotion: boolean;
  motionIntensity: 'none' | 'reduced' | 'normal';
  
  // Haptic preferences
  hapticFeedbackEnabled: boolean;
  hapticIntensity: 'light' | 'normal' | 'strong';
  
  // Visual preferences
  highContrast: boolean;
  largeText: boolean;
  
  // Animation priorities
  preserveFocusAnimations: boolean;
  preserveOrientationAnimations: boolean;
  preserveStateAnimations: boolean;
  preserveDelightAnimations: boolean;
}

export interface HapticPattern {
  type: 'impact' | 'notification' | 'selection';
  style?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  duration?: number;
}

export type AnimationPriority = 'essential' | 'optional';

export interface AnimationConfig {
  priority: AnimationPriority;
  reducedMotionBehavior: 'skip' | 'simplify' | 'preserve';
  duration: number;
  easing: string | number[];
}
