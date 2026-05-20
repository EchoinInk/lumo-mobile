/**
 * Transition Animations
 * 
 * Reusable transition animations using react-native-reanimated.
 * All transitions are subtle, calm, and respect reduced motion preferences.
 */

import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { motion } from '@/theme/motion';
import {
    FadeIn,
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeInUp,
    FadeOut
} from 'react-native-reanimated';

/**
 * Get animation duration based on reduced motion preference
 */
function getDuration(baseDuration: number): number {
  const { preferences } = useAccessibilityStore.getState();
  
  if (preferences.reducedMotion || preferences.motionIntensity === 'none') {
    return 0;
  }
  
  if (preferences.motionIntensity === 'reduced') {
    return Math.floor(baseDuration * 0.5);
  }
  
  return baseDuration;
}

/**
 * Soft fade in animation
 */
export const softFadeIn = (delay = 0) => {
  const duration = getDuration(motion.duration.normal);
  
  return FadeIn.duration(duration).delay(delay);
};

/**
 * Soft fade out animation
 */
export const softFadeOut = (delay = 0) => {
  const duration = getDuration(motion.duration.normal);
  
  return FadeOut.duration(duration).delay(delay);
};

/**
 * Gentle slide up fade in
 */
export const slideUpFadeIn = (delay = 0) => {
  const duration = getDuration(motion.duration.slow);
  
  return FadeInUp.duration(duration).delay(delay);
};

/**
 * Gentle slide down fade in
 */
export const slideDownFadeIn = (delay = 0) => {
  const duration = getDuration(motion.duration.slow);
  
  return FadeInDown.duration(duration).delay(delay);
};

/**
 * Gentle slide right fade in
 */
export const slideRightFadeIn = (delay = 0) => {
  const duration = getDuration(motion.duration.slow);
  
  return FadeInRight.duration(duration).delay(delay);
};

/**
 * Gentle slide left fade in
 */
export const slideLeftFadeIn = (delay = 0) => {
  const duration = getDuration(motion.duration.slow);
  
  return FadeInLeft.duration(duration).delay(delay);
};

/**
 * Staggered fade in for lists
 */
export const staggeredFadeIn = (index: number, baseDelay = 0) => {
  const staggerDelay = baseDelay + (index * 50);
  return softFadeIn(staggerDelay);
};

/**
 * No-op animation for reduced motion
 */
export const noAnimation = () => {
  return FadeIn.duration(0);
};

/**
 * Conditional animation based on reduced motion
 */
export const conditionalAnimation = (animation: any) => {
  const { preferences } = useAccessibilityStore.getState();
  
  if (preferences.reducedMotion || preferences.motionIntensity === 'none') {
    return noAnimation();
  }
  
  return animation;
};
