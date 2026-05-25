import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, CheckCircle2, Plus } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock cleaning tasks
const mockTasks = [
  { id: "1", name: "Kitchen counters", frequency: "Daily", completed: true },
  {
    id: "2",
    name: "Vacuum living room",
    frequency: "Weekly",
    completed: false,
  },
  {
    id: "3",
    name: "Bathroom deep clean",
    frequency: "Weekly",
    completed: false,
  },
  { id: "4", name: "Change bed sheets", frequency: "Weekly", completed: true },
];

export default function CleaningScreen() {
  const completedCount = mockTasks.filter((t) => t.completed).length;
  const progress = (completedCount / mockTasks.length) * 100;

  return (
    <Screen scrollable padded>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <SectionHeader title="Cleaning Schedule" subtitle="This Week" />
      </View>

      {/* Progress Card */}
      <Card variant="gradient" style={styles.progressCard}>
        <View style={styles.progressContent}>
          <Text variant="caption" color={Colors.textInverse}>
            Tasks Completed
          </Text>
          <Text variant="heading" color={Colors.textInverse}>
            {completedCount} / {mockTasks.length}
          </Text>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={progress} height={8} variant="default" />
          </View>
        </View>
      </Card>

      {/* Tasks List */}
      <SectionHeader title="Your Tasks" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockTasks.map((task) => (
          <Card key={task.id} variant="elevated" style={styles.taskCard}>
            <View style={styles.taskContent}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  task.completed && styles.checkboxChecked,
                ]}
              >
                {task.completed && (
                  <CheckCircle2 size={18} color={Colors.textInverse} />
                )}
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text
                  variant="body"
                  style={[
                    styles.taskName,
                    task.completed && styles.taskCompleted,
                  ]}
                >
                  {task.name}
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  {task.frequency}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <LinearGradient
          colors={[Colors.pink, Colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Plus size={20} color={Colors.textInverse} />
          <Text
            variant="body"
            color={Colors.textInverse}
            style={styles.addButtonText}
          >
            Add Task
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  progressCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  progressContent: {
    alignItems: "center",
  },
  progressBarContainer: {
    width: "100%",
    marginTop: Spacing.md,
  },
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  taskCard: {
    padding: Spacing.md,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  addButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius["2xl"],
    ...Shadows.glow,
  },
  addButtonText: {
    fontWeight: "600",
  },
});
