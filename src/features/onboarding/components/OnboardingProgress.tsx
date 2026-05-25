/**
 * Onboarding Progress Indicator
 * Shows current step in onboarding flow
 */

import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import React from "react";
import { StyleSheet, View } from "react-native";

interface OnboardingProgressProps {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.step,
              index < current && styles.stepCompleted,
              index === current - 1 && styles.stepActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  progressBar: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  step: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    minWidth: 40,
  },
  stepCompleted: {
    backgroundColor: Colors.primary,
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
});
