/**
 * CalmModeBanner Component
 *
 * Softly indicates Calm Mode is active.
 * Provides reassurance and an accessible exit path.
 */

import { Text } from "@/components/ui/Text";
import { Colors, Spacing } from "@/theme/tokens";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useCalmMode } from "../hooks/useCalmMode";

interface CalmModeBannerProps {
  onDismiss?: () => void;
}

export function CalmModeBanner({ onDismiss }: CalmModeBannerProps) {
  const { isCalmModeEnabled, disableCalmMode } = useCalmMode();

  if (!isCalmModeEnabled) {
    return null;
  }

  const handleDismiss = () => {
    disableCalmMode();
    onDismiss?.();
  };

  return (
    <View style={styles.container} accessible accessibilityRole="alert">
      <View style={styles.content}>
        <Text variant="caption" style={styles.text}>
          Calm Mode is softening the environment.
        </Text>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Disable Calm Mode"
          accessibilityRole="button"
        >
          <Text variant="caption" style={styles.dismissText}>
            Exit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: Colors.textSecondary,
    flex: 1,
  },
  dismissButton: {
    marginLeft: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  dismissText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
