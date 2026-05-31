import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { ReducedMotionWrapper } from "@/src/features/calmMode/components/ReducedMotionWrapper";
import type { CarryOverItem } from "@/src/features/planning/types/planning";
import { Colors, Spacing } from "@/src/theme/tokens";
import { Moon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

interface EveningResetCardProps {
  carryOverItems: CarryOverItem[];
  eveningCompleted?: boolean;
  onCarryToTomorrow: (sourceId: string) => void;
  onPark: (sourceId: string) => void;
  onAddToBrainDump: () => void;
  onFinishReset: () => void;
}

export function EveningResetCard({
  carryOverItems,
  eveningCompleted = false,
  onCarryToTomorrow,
  onPark,
  onAddToBrainDump,
  onFinishReset,
}: EveningResetCardProps) {
  if (eveningCompleted) {
    return (
      <ReducedMotionWrapper>
        <Card variant="gradient" style={styles.card}>
          <Text variant="subheading" style={styles.title}>
            Reset complete
          </Text>
          <Text variant="body" color={Colors.textSecondary}>
            You did enough to keep moving. Tomorrow can start small.
          </Text>
        </Card>
      </ReducedMotionWrapper>
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
            <Text variant="body" color={Colors.textTertiary}>
              Nothing needs carrying right now. You can leave the rest parked.
            </Text>
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
