/**
 * CalmGradientOverlay Component
 *
 * Reusable atmosphere softener that softens cinematic gradients,
 * reduces brightness spikes, smooths transitions, and calms decorative overlays.
 */

import { Colors } from "@/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useEnvironmentalSoftening } from "../hooks/useEnvironmentalSoftening";
import { getGradientContrastMultiplier } from "../services/environmentalRules";

interface CalmGradientOverlayProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: readonly [string, string, ...string[]];
  disabled?: boolean;
}

export function CalmGradientOverlay({
  children,
  style,
  colors = [Colors.lavender, Colors.background],
  disabled = false,
}: CalmGradientOverlayProps) {
  const { shouldReduceGradientContrast, environmentalProfile } =
    useEnvironmentalSoftening();

  const contrastMultiplier =
    getGradientContrastMultiplier(environmentalProfile);
  const shouldApplySoftening = !disabled && shouldReduceGradientContrast;

  // When gradient contrast is reduced, we use softer, more subtle colors
  const adjustedColors = shouldApplySoftening
    ? ([Colors.borderLight, Colors.background] as const)
    : colors;

  return (
    <View style={[styles.container, style]}>
      {shouldApplySoftening ? (
        <LinearGradient
          colors={adjustedColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
});
