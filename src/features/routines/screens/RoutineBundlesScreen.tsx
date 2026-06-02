import { EmptyState } from "@/src/components/ui/EmptyState";
import { Screen } from "@/src/components/ui/Screen";
import { ScreenBackButton } from "@/src/components/ui/ScreenBackButton";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import {
  createRoutineBundleApplyGuard,
  createTasksFromBundle,
  starterRoutineBundles,
} from "@/src/features/routines";
import { useTasks } from "@/src/features/tasks";
import { Spacing } from "@/src/theme/tokens";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RoutineBundleCard } from "../components/RoutineBundleCard";

export default function RoutineBundlesScreen() {
  const { createTask } = useTasks();
  const applyGuard = useRef(createRoutineBundleApplyGuard()).current;
  const [applyingBundleIds, setApplyingBundleIds] = useState<string[]>([]);

  const handleUseBundle = (bundle: typeof starterRoutineBundles[0]) => {
    if (!applyGuard.begin(bundle.id)) return;

    setApplyingBundleIds((current) =>
      current.includes(bundle.id) ? current : [...current, bundle.id],
    );

    try {
      const tasks = createTasksFromBundle(bundle);
      tasks.forEach((task) => {
        createTask(task);
      });
    } catch (error) {
      applyGuard.release(bundle.id);
      setApplyingBundleIds((current) =>
        current.filter((bundleId) => bundleId !== bundle.id),
      );
      throw error;
    }
  };

  return (
    <Screen scrollable padded>
      <ScreenBackButton fallbackPath="/(tabs)/tasks" />
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
              isApplying={applyingBundleIds.includes(bundle.id)}
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
