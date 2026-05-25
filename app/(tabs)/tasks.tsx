import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import {
    CheckCircle2,
    Circle,
    Clock,
    Lightbulb,
    Plus,
    Target
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock tasks data
const mockTasks = [
  {
    id: "1",
    title: "Morning meditation",
    time: "8:00 AM",
    completed: true,
    priority: "focus",
  },
  {
    id: "2",
    title: "Review design mockups",
    time: "9:30 AM",
    completed: false,
    priority: "focus",
  },
  {
    id: "3",
    title: "Team standup meeting",
    time: "10:00 AM",
    completed: false,
    priority: "normal",
  },
  {
    id: "4",
    title: "Drink water",
    time: "11:00 AM",
    completed: false,
    priority: "reminder",
    recurring: true,
  },
  {
    id: "5",
    title: "Lunch break",
    time: "12:30 PM",
    completed: false,
    priority: "normal",
  },
  {
    id: "6",
    title: "Focus block: coding",
    time: "2:00 PM",
    completed: false,
    priority: "focus",
  },
  {
    id: "7",
    title: "Walk 20 minutes",
    time: "4:00 PM",
    completed: false,
    priority: "reminder",
  },
];

type FilterType = "all" | "today" | "upcoming" | "done";

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "done", label: "Done" },
];

export default function TasksScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [tasks, setTasks] = useState(mockTasks);

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "done") return task.completed;
    if (activeFilter === "today") return !task.completed;
    if (activeFilter === "upcoming")
      return !task.completed && task.priority !== "reminder";
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  return (
    <Screen scrollable padded>
      {/* Header */}
      <SectionHeader
        title="Your Tasks"
        subtitle={`${completedCount} of ${totalCount} completed`}
      />

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            style={[
              styles.filterPill,
              activeFilter === filter.key && styles.filterPillActive,
            ]}
          >
            <Text
              variant="body"
              color={
                activeFilter === filter.key
                  ? Colors.textInverse
                  : Colors.textPrimary
              }
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task List */}
      <View style={styles.taskList}>
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            variant={task.completed ? "outlined" : "elevated"}
            style={[
              styles.taskCard,
              task.priority === "focus" && styles.taskCardFocus,
            ]}
          >
            <TouchableOpacity
              onPress={() => toggleTask(task.id)}
              style={styles.taskContent}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  task.completed && styles.checkboxChecked,
                  task.priority === "focus" &&
                    !task.completed &&
                    styles.checkboxFocus,
                ]}
              >
                {task.completed ? (
                  <CheckCircle2 size={20} color={Colors.textInverse} />
                ) : (
                  <Circle size={20} color={Colors.border} />
                )}
              </View>

              <View style={styles.taskInfo}>
                <Text
                  variant="body"
                  style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>

                <View style={styles.taskMeta}>
                  <View style={styles.timeBadge}>
                    <Clock size={12} color={Colors.textTertiary} />
                    <Text variant="small" color={Colors.textTertiary}>
                      {task.time}
                    </Text>
                  </View>

                  {task.recurring && (
                    <View style={styles.recurringBadge}>
                      <Text variant="small" color={Colors.purple}>
                        Recurring
                      </Text>
                    </View>
                  )}

                  {task.priority === "focus" && !task.completed && (
                    <View style={styles.focusBadge}>
                      <Target size={12} color={Colors.pink} />
                      <Text variant="small" color={Colors.pink}>
                        Focus
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>

      {/* Break Tasks Down Support Card */}
      <Card variant="elevated" style={styles.supportCard}>
        <View style={styles.supportContent}>
          <View
            style={[
              styles.supportIcon,
              { backgroundColor: Colors.purple + "15" },
            ]}
          >
            <Lightbulb size={20} color={Colors.purple} />
          </View>
          <View style={styles.supportText}>
            <Text variant="body" style={styles.supportTitle}>
              Break tasks down
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              Big tasks feel smaller when split into steps
            </Text>
          </View>
        </View>
      </Card>

      {/* Add Task Button */}
      <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
        <LinearGradient
          colors={[Colors.pink, Colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Plus size={24} color={Colors.textInverse} />
          <Text
            variant="subheading"
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
  filterContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  filterPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  taskList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  taskCard: {
    padding: Spacing.md,
  },
  taskCardFocus: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.pink,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkboxFocus: {
    borderColor: Colors.pink,
    backgroundColor: Colors.pink + "10",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  recurringBadge: {
    backgroundColor: Colors.purple + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  focusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.pink + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  supportCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  supportContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  addButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius["2xl"],
    ...Shadows.glow,
  },
  addButtonText: {
    fontWeight: "600",
  },
});
