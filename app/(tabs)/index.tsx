import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { DailyProgressCard } from "@/src/features/dashboard/components/DailyProgressCard";
import { TodayFocusCard } from "@/src/features/dashboard/components/TodayFocusCard";
import { TodaysRoutinesCard } from "@/src/features/dashboard/components/TodaysRoutinesCard";
import { calculateDailyProgress } from "@/src/features/dashboard/utils/dashboardProgress";
import { useHabits } from "@/src/features/habits";
import { useTasks } from "@/src/features/tasks";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Quick Actions Component
import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { Calendar, Flame, Menu, Plus } from "lucide-react-native";

function QuickActions() {
  const actions = [
    {
      label: "Add Task",
      icon: Plus,
      color: Colors.blue,
      onPress: () => router.push({ pathname: "/(tabs)/tasks" as const } as any),
    },
    {
      label: "Add Habit",
      icon: Flame,
      color: Colors.purple,
      onPress: () =>
        router.push({ pathname: "/(tabs)/more/habits" as const } as any),
    },
    {
      label: "Calendar",
      icon: Calendar,
      color: Colors.pink,
      onPress: () =>
        router.push({ pathname: "/(tabs)/calendar" as const } as any),
    },
    {
      label: "More",
      icon: Menu,
      color: Colors.success,
      onPress: () => router.push({ pathname: "/(tabs)/more" as const } as any),
    },
  ];

  return (
    <View style={styles.quickActionsGrid}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <Card
            variant="elevated"
            style={[styles.quickActionCard, { borderColor: action.color }]}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: action.color + "15" },
              ]}
            >
              <action.icon size={18} color={action.color} />
            </View>
            <Text variant="body" style={styles.actionLabel}>
              {action.label}
            </Text>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  // Get real data from Tasks and Habits
  const {
    tasks,
    completedCount: completedTasks,
    toggleTask,
    hasHydrated: tasksHydrated,
  } = useTasks();
  const {
    todayHabits,
    completedToday: completedHabits,
    toggleHabit,
    isHydrated: habitsHydrated,
  } = useHabits();

  // Calculate daily progress combining tasks and habits
  const totalTasks = tasks.length;
  const totalHabits = todayHabits.length;
  const completedTaskCount = completedTasks;
  const completedHabitIds = completedHabits.map((h) => h.id);

  const {
    completionRate,
    supportiveLabel,
    totalTodayItems,
    completedTodayItems,
  } = calculateDailyProgress(
    totalTasks,
    completedTaskCount,
    totalHabits,
    completedHabitIds.length,
  );

  // Prioritize tasks for Today's Focus
  const today = new Date().toISOString().split("T")[0];
  const getPriorityScore = (task: (typeof tasks)[0]) => {
    let score = 0;
    if (task.completed) score -= 1000;
    if (task.priority === "high") score += 100;
    if (task.priority === "medium") score += 50;
    if (task.dueDate === today) score += 200;
    if (task.dueDate && task.dueDate < today) score += 150;
    score += new Date(task.createdAt).getTime() / 1000000000;
    return score;
  };

  const sortedTasks =
    tasksHydrated && tasks.length > 0
      ? [...tasks].sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
      : [];

  const focusTasks = sortedTasks.slice(0, 4);
  const allHydrated = tasksHydrated && habitsHydrated;

  return (
    <Screen scrollable padded>
      {/* Greeting Header */}
      <SectionHeader title="Good morning, Alex" subtitle="You've got this" />

      {/* Daily Progress Card */}
      <DailyProgressCard
        title="Today's Progress"
        progress={completionRate}
        subtitle={supportiveLabel}
        completedCount={completedTodayItems}
        totalCount={totalTodayItems}
        variant="gradient"
      />

      {/* Today's Focus */}
      <TodayFocusCard
        tasks={focusTasks}
        onToggle={toggleTask}
        onAddPress={() =>
          router.push({ pathname: "/(tabs)/tasks" as const } as any)
        }
      />

      {/* Today's Routines */}
      <TodaysRoutinesCard
        habits={todayHabits.slice(0, 4)}
        completedIds={completedHabits.map((h) => h.id)}
        onToggle={toggleHabit}
        onAddPress={() =>
          router.push({ pathname: "/(tabs)/more/habits" as const } as any)
        }
      />

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      <QuickActions />
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.md,
    borderLeftWidth: 3,
    alignItems: "flex-start",
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontWeight: "500",
  },
});
