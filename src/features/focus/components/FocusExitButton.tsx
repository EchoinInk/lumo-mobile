/**
 * FocusExitButton
 *
 * A gentle exit button for Focus Mode.
 * Accessible touch target with non-aggressive styling.
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '@/src/theme/tokens';
import { UX } from '@/src/constants/ux';

interface FocusExitButtonProps {
  onPress: () => void;
}

export function FocusExitButton({ onPress }: FocusExitButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Exit Focus Mode"
      accessibilityHint="Return to standard view"
    >
      <Text style={styles.text}>Exit</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: UX.touchTarget,
    minWidth: UX.touchTargetLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
