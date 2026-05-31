import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import type {
  BrainDumpConversionTarget,
  BrainDumpEntry,
} from "@/src/features/brain-dump";
import { Colors, Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";

interface BrainDumpEntryCardProps {
  entry: BrainDumpEntry;
  onConvert: (entry: BrainDumpEntry, target: BrainDumpConversionTarget) => void;
}

export function BrainDumpEntryCard({
  entry,
  onConvert,
}: BrainDumpEntryCardProps) {
  return (
    <Card variant="outlined" style={styles.card}>
      <Text variant="body" style={styles.text}>
        {entry.text}
      </Text>
      <Text variant="caption" color={Colors.textTertiary}>
        Review gently when ready.
      </Text>
      <View style={styles.actions}>
        <Button size="sm" variant="secondary" onPress={() => onConvert(entry, "task")}>
          Task
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onPress={() => onConvert(entry, "reminder")}
        >
          Reminder
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onPress={() => onConvert(entry, "routine_idea")}
        >
          Routine
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onPress={() => onConvert(entry, "archived_note")}
        >
          Archive
        </Button>
      </View>
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
});
