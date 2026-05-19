/**
 * useReducedMotion Hook
 * 
 * React hook for detecting and responding to reduced motion preferences.
 * Provides accessibility-first animation control.
 */

import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial reduced motion preference
    let isMounted = true;

    const checkReducedMotion = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setReducedMotionEnabled(isEnabled);
        }
      } catch (error) {
        console.error('Error checking reduced motion preference:', error);
        if (isMounted) {
          setReducedMotionEnabled(false);
        }
      }
    };

    checkReducedMotion();

    // Listen for changes in reduced motion preference
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        if (isMounted) {
          setReducedMotionEnabled(isEnabled);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return reducedMotionEnabled;
}
