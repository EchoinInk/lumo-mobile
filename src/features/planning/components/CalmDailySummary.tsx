import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import type { PlanningNextStep } from "@/src/features/planning/types/planning";
import { Colors, Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";

interface CalmDailySummaryProps {
  nextStep?: PlanningNextStep;
  carryOverCount: number;
  brainDumpCount: number;
  morningComplete?: boolean;
  eveningCompleted?: boolean;
  showEveningReset?: boolean;
  onOpenPlanning: () => void;
  onEveningReset: () => void;
}

export function CalmDailySummary({
  nextStep,
  carryOverCount,
  brainDumpCount,
  morningComplete = false,
  eveningCompleted = false,
  showEveningReset = false,
  onOpenPlanning,
  onEveningReset,
}: CalmDailySummaryProps) {
  const shapeLine = morningComplete
    ? nextStep
      ? `Start with: ${nextStep.label}`
      : "Today already has a gentle shape."
    : nextStep
      ? `Start with: ${nextStep.label}`
      : "Choose one gentle next step when ready.";

  return (
    <Card variant="elevated" style={styles.card} accessibilityRole="summary">
      <Text variant="subheading" style={styles.title}>
        Today's shape
      </Text>

      <View style={styles.lines}>
        <Text variant="body" color={Colors.textSecondary}>
          {shapeLine}
        </Text>
        {carryOverCount > 0 && (
          <Text variant="caption" color={Colors.textTertiary}>
            {carryOverCount} thing{carryOverCount === 1 ? "" : "s"} carried
            gently
          </Text>
        )}
        {brainDumpCount > 0 && (
          <Text variant="caption" color={Colors.textTertiary}>
            {brainDumpCount} thought{brainDumpCount === 1 ? "" : "s"} waiting
            in Brain Dump
          </Text>
        )}
        {eveningCompleted && (
          <Text variant="caption" color={Colors.textTertiary}>
            Evening reset complete. Tomorrow can start small.
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {!morningComplete && (
          <Button
            size="sm"
            variant="secondary"
            onPress={onOpenPlanning}
            accessibilityRole="button"
            accessibilityLabel="Open morning planning"
            accessibilityHint="Opens the morning planning flow"
          >
            Open planning
          </Button>
        )}
        {showEveningReset && !eveningCompleted && (
          <Button
            size="sm"
            variant="ghost"
            onPress={onEveningReset}
            accessibilityRole="button"
            accessibilityLabel="Evening reset"
            accessibilityHint="Opens the evening reset flow"
          >
            Evening reset
          </Button>
        )}
      </View>
    </Card>
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
  lines: {
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
