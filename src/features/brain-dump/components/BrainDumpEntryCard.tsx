import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import type {
  BrainDumpConversionTarget,
  BrainDumpEntry,
} from "@/src/features/brain-dump";
import { Colors, Spacing } from "@/src/theme/tokens";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

interface BrainDumpEntryCardProps {
  entry: BrainDumpEntry;
  onConvert: (entry: BrainDumpEntry, target: BrainDumpConversionTarget) => void;
}

export function BrainDumpEntryCard({
  entry,
  onConvert,
}: BrainDumpEntryCardProps) {
  const [isReviewing, setIsReviewing] = useState(false);

  return (
    <Card variant="outlined" style={styles.card}>
      <Text variant="body" style={styles.text}>
        {entry.text}
      </Text>
      <Text variant="caption" color={Colors.textTertiary}>
        Review gently when ready.
      </Text>
      {!isReviewing ? (
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setIsReviewing(true)}
          accessibilityLabel="Review brain dump thought"
          accessibilityHint="Shows calm options for sorting this thought"
        >
          Review / Sort
        </Button>
      ) : (
        <View style={styles.actions}>
          <Text
            variant="caption"
            color={Colors.textSecondary}
            style={styles.actionLabel}
          >
            Sort this thought
          </Text>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => onConvert(entry, "task")}
            accessibilityLabel="Convert to task"
            accessibilityHint="Creates a task from this thought"
          >
            Convert to task
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => onConvert(entry, "reminder")}
            accessibilityLabel="Convert to reminder"
            accessibilityHint="Creates a reminder from this thought"
          >
            Convert to reminder
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => onConvert(entry, "routine_idea")}
            accessibilityLabel="Save as routine idea"
            accessibilityHint="Marks this thought as a routine idea for later"
          >
            Routine idea
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => onConvert(entry, "archived_note")}
            accessibilityLabel="Archive thought"
            accessibilityHint="Parks this thought so it no longer appears in review"
          >
            Archive / park
          </Button>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  text: {
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionLabel: {
    width: "100%",
  },
});
