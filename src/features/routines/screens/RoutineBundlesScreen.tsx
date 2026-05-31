import { EmptyState } from "@/src/components/ui/EmptyState";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { createTasksFromBundle, starterRoutineBundles } from "@/src/features/routines";
import { useTasks } from "@/src/features/tasks";
import { Spacing } from "@/src/theme/tokens";
import { StyleSheet, View } from "react-native";
import { RoutineBundleCard } from "../components/RoutineBundleCard";

export default function RoutineBundlesScreen() {
  const { createTask } = useTasks();

  const handleUseBundle = (bundle: typeof starterRoutineBundles[0]) => {
    const tasks = createTasksFromBundle(bundle);
    tasks.forEach((task) => {
      createTask(task);
    });
  };

  return (
    <Screen scrollable padded>
      <SectionHeader
        title="Routine Bundles"
        subtitle="Start from small repeatable templates."
      />

      <View style={styles.list}>
        {starterRoutineBundles.length === 0 ? (
          <EmptyState
            title="No bundles yet"
            description="Routine bundles will appear here when available."
          />
        ) : (
          starterRoutineBundles.map((bundle) => (
            <RoutineBundleCard
              key={bundle.id}
              bundle={bundle}
              onUse={handleUseBundle}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
  },
});
