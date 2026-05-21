/**
 * Reduced Motion Manager
 * 
 * Centralized reduced motion management and animation scaling.
 */

import { ACCESSIBILITY_CONSTANTS } from '@/constants/accessibility';
import type { AnimationConfig, AnimationPriority } from '@/types/accessibility';

/**
 * Check if animation should run based on reduced motion preference
 */
export function shouldRunAnimation(
  config: AnimationConfig,
  reducedMotion: boolean,
  motionIntensity: 'none' | 'reduced' | 'normal'
): boolean {
  // Skip if motion intensity is none
  if (motionIntensity === 'none') return false;
  
  // Skip if reduced motion and animation is optional
  if (reducedMotion && config.priority === 'optional') return false;
  
  // Run essential animations even with reduced motion
  if (config.priority === 'essential') return true;
  
  // Run optional animations if not reduced motion
  return !reducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 */
export function getAnimationDuration(
  baseDuration: number,
  reducedMotion: boolean,
  motionIntensity: 'none' | 'reduced' | 'normal'
): number {
  if (motionIntensity === 'none') return 0;
  if (reducedMotion || motionIntensity === 'reduced') {
    return Math.min(baseDuration, ACCESSIBILITY_CONSTANTS.REDUCED_MOTION_DURATION);
  }
  return Math.min(baseDuration, ACCESSIBILITY_CONSTANTS.MAX_MOTION_DURATION);
}

/**
 * Scale animation config for reduced motion
 */
export function scaleAnimationConfig(
  config: AnimationConfig,
  reducedMotion: boolean,
  motionIntensity: 'none' | 'reduced' | 'normal'
): AnimationConfig {
  return {
    ...config,
    duration: getAnimationDuration(config.duration, reducedMotion, motionIntensity),
  };
}

/**
 * Create animation config with accessibility awareness
 */
export function createAccessibleAnimationConfig(
  priority: AnimationPriority,
  duration: number,
  easing: string | number[] = 'ease-in-out'
): AnimationConfig {
  return {
    priority,
    reducedMotionBehavior: priority === 'essential' ? 'simplify' : 'skip',
    duration: Math.max(duration, ACCESSIBILITY_CONSTANTS.MIN_MOTION_DURATION),
    easing,
  };
}
