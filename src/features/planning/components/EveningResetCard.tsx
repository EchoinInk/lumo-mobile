import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { ReducedMotionWrapper } from "@/src/features/calmMode/components/ReducedMotionWrapper";
import { EveningResetCompleteCard } from "@/src/features/planning/components/EveningResetCompleteCard";
import type { CarryOverItem } from "@/src/features/planning/types/planning";
import { Colors, Spacing } from "@/src/theme/tokens";
import { Moon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

interface EveningResetCardProps {
  carryOverItems: CarryOverItem[];
  eveningCompleted?: boolean;
  carriedCount?: number;
  parkedCount?: number;
  brainDumpVisited?: boolean;
  onCarryToTomorrow: (sourceId: string) => void;
  onPark: (sourceId: string) => void;
  onAddToBrainDump: () => void;
  onFinishReset: () => void;
  onBackToDashboard?: () => void;
}

export function EveningResetCard({
  carryOverItems,
  eveningCompleted = false,
  carriedCount = 0,
  parkedCount = 0,
  brainDumpVisited = false,
  onCarryToTomorrow,
  onPark,
  onAddToBrainDump,
  onFinishReset,
  onBackToDashboard,
}: EveningResetCardProps) {
  if (eveningCompleted && onBackToDashboard) {
    return (
      <EveningResetCompleteCard
        carriedCount={carriedCount}
        parkedCount={parkedCount}
        brainDumpVisited={brainDumpVisited}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  return (
    <ReducedMotionWrapper>
      <Card variant="gradient" style={styles.card}>
        <View style={styles.header}>
          <Moon
            size={20}
            color={Colors.primary}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text variant="subheading" style={styles.title}>
            Evening reset
          </Text>
        </View>
        <Text variant="body" color={Colors.textSecondary}>
          Close today gently. Tomorrow can start small.
        </Text>

        <View style={styles.section}>
          <Text variant="label" color={Colors.textSecondary}>
            What can be carried gently?
          </Text>
          {carryOverItems.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text variant="body" color={Colors.textTertiary}>
                There is nothing you need to sort tonight.
              </Text>
            </View>
          ) : (
            carryOverItems.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text variant="body" style={styles.itemLabel}>
                  {item.label}
                </Text>
                <View style={styles.itemActions}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => onCarryToTomorrow(item.sourceId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Carry ${item.label} to tomorrow`}
                    accessibilityHint="Moves this item to tomorrow gently"
                  >
                    Carry to tomorrow
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onPark(item.sourceId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Park ${item.label} for later`}
                    accessibilityHint="Parks this item for later without pressure"
                  >
                    Park for later
                  </Button>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text variant="label" color={Colors.textSecondary}>
            Clear your head
          </Text>
          <Button
            variant="ghost"
            onPress={onAddToBrainDump}
            accessibilityRole="button"
            accessibilityLabel="Add to Brain Dump"
            accessibilityHint="Opens Brain Dump to unload remaining thoughts"
          >
            Add to Brain Dump
          </Button>
        </View>

        <Button
          onPress={onFinishReset}
          accessibilityRole="button"
          accessibilityLabel="Finish reset"
          accessibilityHint="Completes your evening reset for today"
        >
          Finish reset
        </Button>
      </Card>
    </ReducedMotionWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontWeight: "600",
  },
  section: {
    gap: Spacing.sm,
  },
  emptyBlock: {
    gap: Spacing.sm,
  },
  itemRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  itemLabel: {
    fontWeight: "500",
  },
  itemActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
