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

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../ui/Text";
import { RetryButton } from "./RetryButton";

interface Props {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function SyncFailureBanner({ onRetry, isRetrying = false }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text variant="body" style={styles.message}>
        Something drifted out of sync
      </Text>
      <RetryButton onPress={onRetry} isRetrying={isRetrying} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1f",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    flex: 1,
    marginRight: 12,
  },
});
