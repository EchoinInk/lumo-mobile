/**
 * Animation Presets
 * 
 * Pre-configured animation worklets for common interactions.
 * All presets are subtle and respect reduced motion.
 */

import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { motion } from '@/theme/motion';
import {
    SharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';

/**
 * Get animation config based on reduced motion
 */
function getAnimationConfig() {
  const { preferences } = useAccessibilityStore.getState();
  
  if (preferences.reducedMotion || preferences.motionIntensity === 'none') {
    return {
      duration: 0,
      disabled: true,
    };
  }
  
  if (preferences.motionIntensity === 'reduced') {
    return {
      duration: motion.duration.fast,
      disabled: false,
    };
  }
  
  return {
    duration: motion.duration.normal,
    disabled: false,
  };
}

/**
 * Press scale animation
 */
export const usePressScale = (pressed: SharedValue<boolean>) => {
  const config = getAnimationConfig();
  
  return useAnimatedStyle(() => {
    if (config.disabled) {
      return {
        transform: [{ scale: 1 }],
      };
    }
    
    const scale = withTiming(pressed.value ? motion.scale.press : motion.scale.default, {
      duration: motion.duration.fast,
    });
    
    return {
      transform: [{ scale }],
    };
  });
};

/**
 * Hover scale animation
 */
export const useHoverScale = (hovered: SharedValue<boolean>) => {
  const config = getAnimationConfig();
  
  return useAnimatedStyle(() => {
    if (config.disabled) {
      return {
        transform: [{ scale: 1 }],
      };
    }
    
    const scale = withTiming(hovered.value ? motion.scale.hover : motion.scale.default, {
      duration: motion.duration.normal,
    });
    
    return {
      transform: [{ scale }],
    };
  });
};

/**
 * Opacity animation
 */
export const useOpacityAnimation = (visible: SharedValue<boolean>) => {
  const config = getAnimationConfig();
  
  return useAnimatedStyle(() => {
    if (config.disabled) {
      return {
        opacity: visible.value ? 1 : 0,
      };
    }
    
    const opacity = withTiming(visible.value ? motion.opacity.default : motion.opacity.press, {
      duration: motion.duration.normal,
    });
    
    return {
      opacity,
    };
  });
};

/**
 * Gentle spring animation
 */
export const useGentleSpring = (toValue: number, fromValue = 0) => {
  const config = getAnimationConfig();
  
  if (config.disabled) {
    return toValue;
  }
  
  return withSpring(toValue, {
    stiffness: motion.easing.spring.stiffness,
    damping: motion.easing.spring.damping,
    mass: motion.easing.spring.mass,
  });
};

/**
 * Soft timing animation
 */
export const useSoftTiming = (toValue: number, fromValue = 0) => {
  const config = getAnimationConfig();
  
  if (config.disabled) {
    return toValue;
  }
  
  return withTiming(toValue, {
    duration: config.duration,
  });
};

/**
 * Card elevation animation
 */
export const useCardElevation = (elevated: SharedValue<boolean>) => {
  const config = getAnimationConfig();
  
  return useAnimatedStyle(() => {
    if (config.disabled) {
      return {
        transform: [{ translateY: 0 }],
        shadowOpacity: 0,
      };
    }
    
    const translateY = withTiming(elevated.value ? -4 : 0, {
      duration: motion.duration.normal,
    });
    
    const shadowOpacity = withTiming(elevated.value ? 0.15 : 0.08, {
      duration: motion.duration.normal,
    });
    
    return {
      transform: [{ translateY }],
      shadowOpacity,
    };
  });
};
