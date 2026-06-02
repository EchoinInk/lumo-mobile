/**
 * Sync Failure Banner
 *
 * Displays a gentle banner when sync has failed.
 * Tone: Calm, reassuring, not alarming.
 *
 * Messaging philosophy:
 * - Avoid harsh "failure" language
 * - Use gentle drift metaphors
 * - Offer clear retry path
 */

import { Colors, Radius, Spacing } from "@/theme/tokens";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../ui/Text";
import { RetryButton } from "./RetryButton";

interface Props {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function SyncFailureBanner({
  onRetry,
  isRetrying = false,
}: Props): React.JSX.Element {
  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel="Something drifted out of sync"
    >
      <Text variant="body" style={styles.message}>
        Something drifted out of sync
      </Text>
      <RetryButton onPress={onRetry} isRetrying={isRetrying} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  message: {
    flex: 1,
  },
});
