import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { PartyPopper, Sparkles } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ProgressSummaryCardProps {
  completedTasks?: number;
  totalTasks?: number;
}

export function ProgressSummaryCard({
  completedTasks = 3,
  totalTasks = 6,
}: ProgressSummaryCardProps) {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={styles.header}>
            <PartyPopper size={18} color={Colors.pink} />
            <Text variant="body" style={styles.celebrationText}>
              You did this!
            </Text>
          </View>
          <Text variant="subheading" style={styles.title}>
            Completed
          </Text>
          <Text variant="body" color={Colors.textSecondary}>
            {completedTasks} / {totalTasks} tasks
          </Text>
          <ProgressBar
            progress={progress}
            height={8}
            variant="gradient"
            style={styles.progressBar}
          />
        </View>
        <View style={styles.illustrationContainer}>
          {/* Placeholder for mascot illustration */}
          <View style={styles.mascotPlaceholder}>
            <Sparkles size={24} color={Colors.purpleSoft} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  celebrationText: {
    fontWeight: "600",
    color: Colors.pink,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  progressBar: {
    marginTop: Spacing.md,
    maxWidth: 150,
  },
  illustrationContainer: {
    marginLeft: Spacing.md,
  },
  mascotPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Radius['3xl'],
    backgroundColor: Colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
  },
});
