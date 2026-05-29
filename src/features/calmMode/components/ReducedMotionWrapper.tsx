/**
 * ReducedMotionWrapper Component
 *
 * Reusable wrapper for reducing animation intensity,
 * shortening motion distance, and disabling non-essential motion.
 * Respects accessibility and preserves responsiveness.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useEnvironmentalSoftening } from '../hooks/useEnvironmentalSoftening';
import { getAnimationDurationMultiplier } from '../services/environmentalRules';

interface ReducedMotionWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export function ReducedMotionWrapper({ children, style, disabled = false }: ReducedMotionWrapperProps) {
  const { shouldReduceMotion, environmentalProfile } = useEnvironmentalSoftening();

  const durationMultiplier = getAnimationDurationMultiplier(environmentalProfile);
  const shouldApplyReduction = !disabled && shouldReduceMotion;

  const containerStyle = [
    styles.container,
    shouldApplyReduction && styles.reducedMotion,
    style,
  ];

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Default container with no motion restrictions
  },
  reducedMotion: {
    // When motion is reduced, we avoid transform/opacity animations
    // This is a marker style - actual motion reduction is handled
    // by consuming components checking shouldReduceMotion
  },
});
