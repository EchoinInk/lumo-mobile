import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import type { LowEnergyOption } from "@/src/features/planning/types/planning";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";

interface LowEnergyPlanCardProps {
  options: LowEnergyOption[];
  selectedId?: string;
  onChoose: (optionId: string) => void;
  onPark: (sourceId: string, sourceType: LowEnergyOption["sourceType"]) => void;
  embedded?: boolean;
}

export function LowEnergyPlanCard({
  options,
  selectedId,
  onChoose,
  onPark,
  embedded = false,
}: LowEnergyPlanCardProps) {
  const content = (
    <>
      <Text variant="subheading" style={styles.title}>
        Today can be lighter.
      </Text>
      <Text variant="body" color={Colors.textSecondary}>
        A lighter plan still counts. One supportive action is enough.
      </Text>
      <Text variant="caption" color={Colors.textTertiary}>
        The rest can wait.
      </Text>

      {options.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text variant="body" color={Colors.textSecondary}>
            No pressure — you can start with a small reset.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {options.map((option) => {
            const isSelected = option.id === selectedId;
            return (
              <View
                key={option.id}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <View style={styles.optionText}>
                  <Text variant="caption" color={Colors.primary}>
                    {option.reason}
                  </Text>
                  <Text variant="body" style={styles.optionLabel}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Text variant="caption" color={Colors.textTertiary}>
                      Chosen for today
                    </Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <Button
                    size="sm"
                    variant={isSelected ? "secondary" : "primary"}
                    onPress={() => onChoose(option.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${option.label}`}
                    accessibilityHint="Selects this as your one small step for today"
                    accessibilityState={{ selected: isSelected }}
                  >
                    {isSelected ? "Chosen" : "Choose this"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onPark(option.sourceId, option.sourceType)}
                    accessibilityRole="button"
                    accessibilityLabel={`Park ${option.label} for later`}
                    accessibilityHint="Parks this option for later"
                  >
                    Park for later
                  </Button>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );

  if (embedded) {
    return <View style={styles.embedded}>{content}</View>;
  }

  return (
    <Card variant="gradient" style={styles.card}>
      {content}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  embedded: {
    gap: Spacing.sm,
  },
  title: {
    fontWeight: "600",
  },
  emptyBlock: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  list: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  option: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card + "CC",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionSelected: {
    borderColor: Colors.primary + "80",
    backgroundColor: Colors.card,
  },
  optionText: {
    gap: Spacing.xs,
  },
  optionLabel: {
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
