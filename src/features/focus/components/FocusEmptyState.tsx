/**
 * FocusEmptyState
 *
 * A supportive empty state when no task is selected in Focus Mode.
 * Encourages choosing one gentle next step.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Colors, Spacing, Typography } from '@/src/theme/tokens';

interface FocusEmptyStateProps {
  onSelectTask?: () => void;
}

export function FocusEmptyState({ onSelectTask }: FocusEmptyStateProps) {
  return (
    <View style={styles.container}>
      <EmptyState
        title="Choose one gentle next step."
        description="Pick a task to focus on, or take a moment to breathe."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xl,
  },
});
