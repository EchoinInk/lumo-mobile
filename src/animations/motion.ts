/**
 * Motion Utilities
 * 
 * Centralized motion configuration and utilities.
 * Provides consistent motion behavior across the app.
 */

import { motion } from '@/theme/motion';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

/**
 * Get adjusted duration based on accessibility preferences
 */
export const getAdjustedDuration = (baseDuration: number): number => {
  const { preferences } = useAccessibilityStore.getState();
  
  if (preferences.reducedMotion || preferences.motionIntensity === 'none') {
    return 0;
  }
  
  if (preferences.motionIntensity === 'reduced') {
    return Math.floor(baseDuration * 0.5);
  }
  
  return baseDuration;
};

/**
 * Check if animation should run based on priority
 */
export const shouldAnimate = (priority: 'essential' | 'optional' | 'delight'): boolean => {
  const { preferences } = useAccessibilityStore.getState();
  
  if (preferences.reducedMotion || preferences.motionIntensity === 'none') {
    return false;
  }
  
  switch (priority) {
    case 'essential':
      return preferences.preserveFocusAnimations;
    case 'optional':
      return preferences.preserveDelightAnimations;
    case 'delight':
      return preferences.preserveDelightAnimations;
    default:
      return true;
  }
};

/**
 * Get spring config based on preferences
 */
export const getSpringConfig = () => {
  const { preferences } = useAccessibilityStore.getState();
  
  if (preferences.reducedMotion || preferences.motionIntensity === 'none') {
    return {
      stiffness: 1000,
      damping: 100,
      mass: 0.1,
    };
  }
  
  if (preferences.motionIntensity === 'reduced') {
    return {
      stiffness: 400,
      damping: 30,
      mass: 0.5,
    };
  }
  
  return motion.easing.spring;
};

/**
 * Get easing based on preferences
 */
export const getEasing = (easing: keyof typeof motion.easing) => {
  const { preferences } = useAccessibilityStore.getState();
  
  if (preferences.reducedMotion || preferences.motionIntensity === 'none') {
    return 'linear';
  }
  
  return motion.easing[easing];
};

/**
 * Motion configuration object
 */
export const motionConfig = {
  durations: motion.duration,
  easing: motion.easing,
  scale: motion.scale,
  opacity: motion.opacity,
  
  getDuration: getAdjustedDuration,
  shouldAnimate,
  getSpringConfig,
  getEasing,
} as const;
