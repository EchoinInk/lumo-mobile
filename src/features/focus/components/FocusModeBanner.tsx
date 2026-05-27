/**
 * FocusModeBanner
 *
 * A calm, non-alarming banner that shows Focus Mode is active.
 * Displays a soft message with one visible exit action.
 */

import { Colors, Spacing, Typography } from "@/src/theme/tokens";
import { StyleSheet, Text, View } from "react-native";
import { FocusExitButton } from "./FocusExitButton";

interface FocusModeBannerProps {
  onExit: () => void;
}

export function FocusModeBanner({ onExit }: FocusModeBannerProps) {
  return (
    <View style={styles.container} accessible>
      <Text
        style={styles.message}
        accessible
        accessibilityLabel="Focus Mode is keeping things simple"
      >
        Focus Mode is keeping things simple.
      </Text>
      <FocusExitButton onPress={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lavender,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
});
