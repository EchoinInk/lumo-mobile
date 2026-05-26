/**
 * useReducedMotion Hook
 *
 * React hook for detecting and responding to reduced motion preferences.
 * Combines system preference with user setting for accessibility-first animation control.
 */

import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion() {
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const userReducedMotion = useSettingsStore(
    (state) => state.settings.reducedMotion,
  );

  useEffect(() => {
    // Check initial reduced motion preference
    let isMounted = true;

    const checkReducedMotion = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setSystemReducedMotion(isEnabled);
        }
      } catch (error) {
        console.error("Error checking reduced motion preference:", error);
        if (isMounted) {
          setSystemReducedMotion(false);
        }
      }
    };

    checkReducedMotion();

    // Listen for changes in reduced motion preference
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (isEnabled: boolean) => {
        if (isMounted) {
          setSystemReducedMotion(isEnabled);
        }
      },
    );

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  // Return true if either system or user preference is enabled
  return systemReducedMotion || userReducedMotion;
}
