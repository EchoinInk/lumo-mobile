/**
 * Retry Button
 *
 * A gentle retry button for recovery actions.
 * Tone: Calm, reassuring, not alarming.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "../ui/Button";

interface Props {
  onPress: () => void;
  isRetrying?: boolean;
}

export function RetryButton({ onPress, isRetrying = false }: Props): React.JSX.Element {
  return (
    <Button
      onPress={onPress}
      disabled={isRetrying}
      style={styles.button}
      variant="ghost"
      accessibilityLabel={isRetrying ? "Retry in progress" : "Try again"}
      accessibilityHint="Attempts the recovery action again"
    >
      {isRetrying ? "Trying again..." : "Try again"}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 100,
  },
});
