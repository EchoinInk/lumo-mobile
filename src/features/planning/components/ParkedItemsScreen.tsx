import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Screen } from "@/src/components/ui/Screen";
import { ScreenBackButton } from "@/src/components/ui/ScreenBackButton";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { useBrainDump } from "@/src/features/brain-dump";
import { useHabits } from "@/src/features/habits";
import { useDailyPlanningFlow } from "@/src/features/planning/hooks/useDailyPlanningFlow";
import { useReminders } from "@/src/features/reminders";
import { useTasks } from "@/src/features/tasks";
import { Colors, Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";

type ParkedItem = {
  id: string;
  title: string;
  sourceLabel: string;
  parkedAt?: string;
  onBringBack: () => void;
};

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function ParkedItemsScreen() {
  const planning = useDailyPlanningFlow("morning");
  const brainDump = useBrainDump();
  const { tasks } = useTasks();
  const { reminders } = useReminders();
  const { habits } = useHabits();

  const archivedThoughts: ParkedItem[] = brainDump.entries
    .filter((entry) => entry.status === "archived")
    .map((entry) => ({
      id: `brain-${entry.id}`,
      title: entry.text,
      sourceLabel: "Brain Dump",
      parkedAt: entry.convertedAt ?? entry.updatedAt,
      onBringBack: () => brainDump.restoreEntry(entry.id),
    }));

  const planningParkedIds = [
    ...new Set([
      ...planning.summary.parkedIds,
      ...planning.summary.eveningParkedIds,
    ]),
  ];

  const planningItems: ParkedItem[] = planningParkedIds
    .map((sourceId) => {
      const task = tasks.find((item) => item.id === sourceId);
      if (task) {
        return {
          id: `planning-task-${sourceId}`,
          title: task.title,
          sourceLabel: "Planning · Task",
          onBringBack: () => planning.bringBackParkedItem(sourceId),
        };
      }

      const reminder = reminders.find((item) => item.id === sourceId);
      if (reminder) {
        return {
          id: `planning-reminder-${sourceId}`,
          title: reminder.title,
          sourceLabel: "Planning · Reminder",
          onBringBack: () => planning.bringBackParkedItem(sourceId),
        };
      }

      const thought = brainDump.entries.find((entry) => entry.id === sourceId);
      if (thought) {
        return {
          id: `planning-brain-${sourceId}`,
          title: thought.text,
          sourceLabel: "Planning · Brain Dump",
          parkedAt: thought.convertedAt ?? thought.updatedAt,
          onBringBack: () => {
            brainDump.restoreEntry(thought.id);
            planning.bringBackParkedItem(sourceId);
          },
        };
      }

      const routine = habits.find((habit) => habit.title === sourceId);
      if (routine || sourceId === "low-energy-reset") {
        return {
          id: `planning-routine-${sourceId}`,
          title: routine?.title ?? "Take a small reset",
          sourceLabel: "Planning · Routine",
          onBringBack: () => planning.bringBackParkedItem(sourceId),
        };
      }

      return {
        id: `planning-${sourceId}`,
        title: "Saved for later",
        sourceLabel: "Planning",
        onBringBack: () => planning.bringBackParkedItem(sourceId),
      };
    })
    .filter(
      (item) =>
        !archivedThoughts.some(
          (thought) => thought.id === item.id.replace("planning-", ""),
        ),
    );

  const parkedItems = [...planningItems, ...archivedThoughts];

  return (
    <Screen scrollable padded>
      <ScreenBackButton fallbackPath="/(tabs)" />
      <SectionHeader
        title="Parked items"
        subtitle="Things you saved for later."
      />

      {parkedItems.length === 0 ? (
        <EmptyState
          title="Nothing is parked right now."
          description="When you park something, it will wait here calmly."
        />
      ) : (
        <View style={styles.list}>
          {parkedItems.map((item) => (
            <Card key={item.id} variant="outlined" style={styles.card}>
              <View style={styles.details}>
                <Text variant="caption" color={Colors.primary}>
                  {item.sourceLabel}
                </Text>
                <Text variant="body" style={styles.title}>
                  {item.title}
                </Text>
                {item.parkedAt && (
                  <Text variant="caption" color={Colors.textTertiary}>
                    Parked {formatDate(item.parkedAt)}
                  </Text>
                )}
              </View>

              <Button
                size="sm"
                variant="secondary"
                onPress={item.onBringBack}
                accessibilityRole="button"
                accessibilityLabel={`Bring back ${item.title}`}
                accessibilityHint="Returns this item to active planning or Brain Dump review"
              >
                Bring back
              </Button>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
  },
  card: {
    gap: Spacing.md,
  },
  details: {
    gap: Spacing.xs,
  },
  title: {
    fontWeight: "600",
  },
});
