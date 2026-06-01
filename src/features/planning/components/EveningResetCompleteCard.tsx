import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { PlanningGentleFade } from "@/src/features/planning/components/PlanningGentleFade";
import { Colors, Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";

interface EveningResetCompleteCardProps {
  carriedCount: number;
  parkedCount: number;
  brainDumpVisited: boolean;
  onBackToDashboard: () => void;
}

export function EveningResetCompleteCard({
  carriedCount,
  parkedCount,
  brainDumpVisited,
  onBackToDashboard,
}: EveningResetCompleteCardProps) {
  return (
    <PlanningGentleFade>
      <Card variant="gradient" style={styles.card}>
        <Text variant="subheading" style={styles.title}>
          Today is closed gently.
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          Tomorrow can start small. You're allowed to stop here.
        </Text>

        <View style={styles.details}>
          {carriedCount > 0 && (
            <Text variant="caption" color={Colors.textTertiary}>
              {carriedCount} thing{carriedCount === 1 ? "" : "s"} carried to
              tomorrow
            </Text>
          )}
          {parkedCount > 0 && (
            <Text variant="caption" color={Colors.textTertiary}>
              {parkedCount} thing{parkedCount === 1 ? "" : "s"} parked for later
            </Text>
          )}
          {brainDumpVisited && (
            <Text variant="caption" color={Colors.textTertiary}>
              Brain Dump is ready if anything else comes up
            </Text>
          )}
          {carriedCount === 0 && parkedCount === 0 && !brainDumpVisited && (
            <Text variant="caption" color={Colors.textTertiary}>
              Anything unfinished has somewhere to land.
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            onPress={onBackToDashboard}
            accessibilityRole="button"
            accessibilityLabel="Back to Dashboard"
            accessibilityHint="Returns to the Dashboard"
          >
            Back to Dashboard
          </Button>
        </View>
      </Card>
    </PlanningGentleFade>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontWeight: "600",
  },
  details: {
    gap: Spacing.xs,
  },
  actions: {
    marginTop: Spacing.xs,
  },
});
