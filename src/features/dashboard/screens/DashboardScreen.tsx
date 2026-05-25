import { EmptyState } from "@/src/components/ui/EmptyState";
import { Screen } from "@/src/components/ui/Screen";
import { useHabits } from "@/src/features/habits";
import { useTasks } from "@/src/features/tasks";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { DailyProgressCard } from "../components/DailyProgressCard";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardSection } from "../components/DashboardSection";
import { QuickActions } from "../components/QuickActions";
import { TodayFocusCard } from "../components/TodayFocusCard";
import { TodaysRoutinesCard } from "../components/TodaysRoutinesCard";
import { calculateDailyProgress } from "../utils/dashboardProgress";

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

  // Calculate daily progress
  const totalTasks = tasks.length;
  const totalHabits = todayHabits.length;
  const completedTaskCount = completedTasks;
  const completedHabitCount = completedHabits.length;

  const {
    completionRate,
    supportiveLabel,
    totalTodayItems,
    completedTodayItems,
  } = calculateDailyProgress(
    totalTasks,
    completedTaskCount,
    totalHabits,
    completedHabitCount,
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

  return (
    <Screen scrollable padded>
      {/* Header Section */}
      <DashboardHeader />

      {/* Daily Progress */}
      <DailyProgressCard
        title="Today's Progress"
        progress={completionRate}
        subtitle={supportiveLabel}
        completedCount={completedTodayItems}
        totalCount={totalTodayItems}
        variant="gradient"
      />

      {/* Today's Focus */}
      <DashboardSection title="Today's Focus" actionLabel="View All">
        <TodayFocusCard
          tasks={focusTasks}
          onToggle={toggleTask}
          onAddPress={() => router.push("/(tabs)/tasks")}
        />
      </DashboardSection>

      {/* Today's Routines */}
      <DashboardSection title="Today's Routines">
        <TodaysRoutinesCard
          habits={todayHabits.slice(0, 4)}
          completedIds={completedHabits.map((h) => h.id)}
          onToggle={toggleHabit}
          onAddPress={() => router.push("/(tabs)/more/habits")}
        />
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection title="Quick Actions">
        <QuickActions />
      </DashboardSection>

      {/* Empty State Demo */}
      <DashboardSection title="Upcoming">
        <EmptyState
          title="No upcoming events"
          description="You're all caught up for today"
        />
      </DashboardSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
