/**
 * Reduced Motion Utilities
 * 
 * Utilities for handling reduced motion preferences.
 * Ensures all animations respect accessibility settings.
 */

import { useReducedMotion as useSystemReducedMotion } from '@/hooks/useReducedMotion';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

/**
 * Check if reduced motion is enabled
 * Combines system preference with app-level setting
 */
export const useReducedMotion = () => {
  const systemReducedMotion = useSystemReducedMotion();
  const { preferences } = useAccessibilityStore();
  
  // Use the more restrictive option
  return systemReducedMotion || preferences.reducedMotion;
};

/**
 * Check if animations should be simplified
 */
export const useSimplifiedMotion = () => {
  const { preferences } = useAccessibilityStore();
  
  return preferences.motionIntensity === 'reduced' || preferences.motionIntensity === 'none';
};

/**
 * Get motion intensity level
 */
export const useMotionIntensity = () => {
  const { preferences } = useAccessibilityStore();
  
  return preferences.motionIntensity;
};

/**
 * Check if haptics are enabled
 */
export const useHapticsEnabled = () => {
  const { preferences } = useAccessibilityStore();
  
  return preferences.hapticFeedbackEnabled;
};

/**
 * Check if specific animation type should run
 */
export const useAnimationEnabled = (type: 'focus' | 'orientation' | 'state' | 'delight') => {
  const reducedMotion = useReducedMotion();
  const { preferences } = useAccessibilityStore();
  
  if (reducedMotion) {
    return false;
  }
  
  switch (type) {
    case 'focus':
      return preferences.preserveFocusAnimations;
    case 'orientation':
      return preferences.preserveOrientationAnimations;
    case 'state':
      return preferences.preserveStateAnimations;
    case 'delight':
      return preferences.preserveDelightAnimations;
    default:
      return true;
  }
};

/**
 * Get animation duration multiplier
 */
export const useDurationMultiplier = () => {
  const { preferences } = useAccessibilityStore();
  
  switch (preferences.motionIntensity) {
    case 'none':
      return 0;
    case 'reduced':
      return 0.5;
    case 'normal':
    default:
      return 1;
  }
};
