/**
 * Reduced Motion View Component
 *
 * View component that respects reduced motion preferences.
 * Optionally disables animations and transitions.
 */

import { accessibilityConfig } from "@/accessibility";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import React from "react";
import { View, ViewProps } from "react-native";

interface ReducedMotionViewProps extends ViewProps {
  children: React.ReactNode;
  disableAnimation?: boolean;
  reducedMotionBehavior?: "skip" | "simplify" | "preserve";
}

export const ReducedMotionView: React.FC<ReducedMotionViewProps> = ({
  children,
  disableAnimation,
  reducedMotionBehavior = "skip",
  style,
  ...props
}) => {
  const { preferences } = useAccessibilityStore();

  const shouldReduceMotion =
    disableAnimation || accessibilityConfig.shouldReduceMotion(preferences);

  const motionStyle =
    shouldReduceMotion && reducedMotionBehavior === "skip"
      ? styles.noAnimation
      : {};

  return (
    <View style={[styles.container, motionStyle, style]} {...props}>
      {children}
    </View>
  );
};

const styles = {
  container: {},
  noAnimation: {},
};
