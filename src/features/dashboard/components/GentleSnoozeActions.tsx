import { Button } from "@/src/components/ui/Button";
import { Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";

interface GentleSnoozeActionsProps {
  onSnooze: () => void;
  onLater: () => void;
}

export function GentleSnoozeActions({
  onSnooze,
  onLater,
}: GentleSnoozeActionsProps) {
  return (
    <View style={styles.container}>
      <Button
        size="sm"
        variant="ghost"
        onPress={onSnooze}
        accessibilityHint="Moves this item out of today"
      >
        Snooze gently
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onPress={onLater}
        accessibilityHint="Moves this item to tomorrow"
      >
        Later
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
