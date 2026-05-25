import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { useTasks } from "@/src/features/tasks";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import {
    CheckCircle2,
    Circle,
    Flame,
    Sparkles,
    Trophy,
    Utensils,
    Wallet,
} from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Mock data for stats
const mockStats = [
  {
    label: "Tasks",
    value: "5",
    change: "3 done today",
    icon: CheckCircle2,
    color: Colors.blue,
  },
  {
    label: "Habits",
    value: "7",
    change: "day streak",
    icon: Flame,
    color: Colors.purple,
  },
  {
    label: "Calories",
    value: "1,320",
    change: "of 1,800",
    icon: Utensils,
    color: Colors.pink,
  },
  {
    label: "Budget",
    value: "$420",
    change: "remaining",
    icon: Wallet,
    color: Colors.success,
  },
];

// Mock small wins
const smallWins = [
  { text: "Completed morning routine!", icon: CheckCircle2 },
  { text: "7-day habit streak", icon: Flame },
  { text: "Stayed under budget", icon: Wallet },
];

// Fallback mock focus items when no tasks exist
const fallbackFocusItems = [
  { id: "1", text: "Morning meds", completed: true },
  { id: "2", text: "Team standup", completed: true },
  { id: "3", text: "Focus block: Design", completed: false, highlight: true },
  { id: "4", text: "Walk 30 min", completed: false },
];

// Quick actions
const quickActions = [
  { label: "Add Task", color: Colors.blue },
  { label: "Log Meal", color: Colors.pink },
  { label: "Add Expense", color: Colors.success },
  { label: "Log Weight", color: Colors.purple },
];

export default function DashboardScreen() {
  const {
    tasks,
    activeTasks,
    completedTasks,
    completedCount,
    totalCount,
    toggleTask,
    hasHydrated,
  } = useTasks();

  // Use real tasks if available, otherwise fallback to mock
  const focusItems =
    hasHydrated && tasks.length > 0
      ? tasks.slice(0, 4).map((t) => ({
          id: t.id,
          text: t.title,
          completed: t.completed,
          highlight: t.priority === "high",
        }))
      : fallbackFocusItems;

  const displayCompletedCount = hasHydrated
    ? completedCount
    : fallbackFocusItems.filter((t) => t.completed).length;
  const displayTotalCount = hasHydrated
    ? Math.min(totalCount, 4)
    : fallbackFocusItems.length;
  const progress =
    displayTotalCount > 0
      ? (displayCompletedCount / displayTotalCount) * 100
      : 0;

  return (
    <Screen scrollable padded>
      {/* Greeting Header */}
      <SectionHeader title="Good morning, Alex" subtitle="You've got this" />

      {/* Today&apos;s Focus Card */}
      <Card variant="elevated" style={styles.focusCard}>
        <Text variant="subheading" style={styles.cardTitle}>
          Today&apos;s Focus
        </Text>
        <View style={styles.focusList}>
          {focusItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.focusItem}
              onPress={() =>
                hasHydrated &&
                tasks.find((t) => t.id === item.id) &&
                toggleTask(item.id)
              }
              activeOpacity={
                hasHydrated && tasks.find((t) => t.id === item.id) ? 0.7 : 1
              }
              accessibilityLabel={`${item.completed ? "Completed" : "Pending"}: ${item.text}`}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxChecked,
                  item.highlight && !item.completed && styles.checkboxHighlight,
                ]}
              >
                {item.completed ? (
                  <CheckCircle2 size={14} color={Colors.textInverse} />
                ) : (
                  <Circle size={14} color={Colors.border} />
                )}
              </View>
              <Text
                variant="body"
                style={[
                  styles.focusText,
                  item.completed && styles.focusTextCompleted,
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[Colors.pinkSoft, Colors.purpleSoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text variant="caption" color={Colors.textSecondary}>
            {displayCompletedCount}/{displayTotalCount} done
          </Text>
        </View>
      </Card>

      {/* Quick Actions Grid */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} activeOpacity={0.7}>
            <Card
              variant="elevated"
              style={[styles.quickActionCard, { borderColor: action.color }]}
            >
              <View
                style={[styles.actionDot, { backgroundColor: action.color }]}
              />
              <Text variant="body" style={styles.actionLabel}>
                {action.label}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* You Did This Progress Card */}
      <Card variant="gradient" style={styles.youDidThisCard}>
        <View style={styles.youDidThisContent}>
          <Trophy size={24} color={Colors.textInverse} />
          <View style={styles.youDidThisText}>
            <Text variant="subheading" color={Colors.textInverse}>
              You did this!
            </Text>
            <Text variant="body" color={Colors.textInverse}>
              {displayCompletedCount} tasks completed today
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Text variant="caption" color={Colors.primary}>
              3 day streak
            </Text>
          </View>
        </View>
      </Card>

      {/* Stats Grid */}
      <SectionHeader title="At a glance" />
      <View style={styles.statsGrid}>
        {mockStats.map((stat, index) => (
          <Card key={index} variant="elevated" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + "15" },
                ]}
              >
                <stat.icon size={18} color={stat.color} />
              </View>
              <Text variant="caption" color={Colors.textSecondary}>
                {stat.label}
              </Text>
            </View>
            <Text variant="heading" style={styles.statValue}>
              {stat.value}
            </Text>
            <Text variant="small" color={Colors.textSecondary}>
              {stat.change}
            </Text>
          </Card>
        ))}
      </View>

      {/* Reminder Card */}
      <Card variant="outlined" style={styles.reminderCard}>
        <View style={styles.reminderContent}>
          <View
            style={[
              styles.reminderIcon,
              { backgroundColor: Colors.blue + "15" },
            ]}
          >
            <Sparkles size={18} color={Colors.blue} />
          </View>
          <View style={styles.reminderText}>
            <Text variant="body" style={styles.reminderTitle}>
              Gentle reminder
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              Take a moment to breathe and reset
            </Text>
          </View>
        </View>
      </Card>

      {/* Supportive Encouragement */}
      <Card variant="elevated" style={styles.encouragementCard}>
        <Text variant="body" style={styles.encouragementText}>
          &quot;Small steps every day lead to big changes. You&apos;re doing
          great!"
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  focusCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  focusList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  focusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
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
  checkboxHighlight: {
    borderColor: Colors.pink,
    backgroundColor: Colors.pink + "10",
  },
  focusText: {
    flex: 1,
    fontWeight: "500",
  },
  focusTextCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.lavender,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Radius.full,
  },
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
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontWeight: "500",
  },
  youDidThisCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  youDidThisContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  youDidThisText: {
    flex: 1,
  },
  streakBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  reminderCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  reminderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderText: {
    flex: 1,
  },
  reminderTitle: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  encouragementCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.lavender,
  },
  encouragementText: {
    fontStyle: "italic",
    textAlign: "center",
    color: Colors.textSecondary,
  },
});
