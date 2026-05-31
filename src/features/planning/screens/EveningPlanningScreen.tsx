import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Button } from "@/src/components/ui/Button";
import { EveningResetCard } from "@/src/features/planning/components/EveningResetCard";
import { useDailyPlanningFlow } from "@/src/features/planning/hooks/useDailyPlanningFlow";
import { Spacing } from "@/src/theme/tokens";
import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

export function EveningPlanningScreen() {
  const flow = useDailyPlanningFlow("evening");

  const handleFinish = useCallback(() => {
    flow.completeEveningReset();
    router.back();
  }, [flow]);

  return (
    <Screen scrollable padded>
      <SectionHeader
        title="Evening reset"
        subtitle="Close the loop without making it a project"
      />
      <EveningResetCard
        carryOverItems={flow.carryOverItems}
        eveningCompleted={flow.summary.eveningCompleted}
        onCarryToTomorrow={flow.carryToTomorrow}
        onPark={flow.parkItem}
        onAddToBrainDump={() =>
          router.push({ pathname: "/brain-dump" as const } as any)
        }
        onFinishReset={handleFinish}
      />
    </Screen>
  );
}

export function PlanningHubScreen() {
  return (
    <Screen scrollable padded>
      <SectionHeader
        title="Daily planning"
        subtitle="Shape your day gently"
      />
      <View style={styles.actions}>
        <Button
          onPress={() =>
            router.push({ pathname: "/planning/morning" as const } as any)
          }
          accessibilityRole="button"
          accessibilityLabel="Morning planning"
          accessibilityHint="Opens the morning planning flow"
        >
          Morning planning
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            router.push({ pathname: "/planning/evening" as const } as any)
          }
          accessibilityRole="button"
          accessibilityLabel="Evening reset"
          accessibilityHint="Opens the evening reset flow"
        >
          Evening reset
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.md,
  },
});
