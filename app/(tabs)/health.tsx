import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { HabitFormModal } from "@/src/features/habits/components/HabitFormModal";
import { HabitListItem } from "@/src/features/habits/components/HabitListItem";
import { useHabits } from "@/src/features/habits/hooks/useHabits";
import { CreateHabitInput, Habit } from "@/src/features/habits/types/habit";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    ArrowRight,
    Dumbbell,
    Flame,
    Heart,
    Plus,
    Scale,
    TrendingDown,
    Utensils,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Mock health data (only for non-habits)
const healthSummary = {
  calories: {
    consumed: 1320,
    goal: 1800,
  },
  weight: {
    current: 165.2,
    change: -2.8,
    unit: "lbs",
  },
  workouts: {
    thisWeek: 3,
    caloriesBurned: 600,
    lastWorkout: "Yoga Flow",
  },
};

// Quick links to health screens
const healthLinks = [
  {
    title: "My Habits",
    icon: Flame,
    color: Colors.purple,
    route: "/more/habits",
  },
  {
    title: "My Meals",
    icon: Utensils,
    color: Colors.pink,
    route: "/more/meals",
  },
  {
    title: "Weight Tracker",
    icon: Scale,
    color: Colors.primary,
    route: "/more/weight",
  },
  {
    title: "Workout Log",
    icon: Dumbbell,
    color: Colors.warning,
    route: "/more/workouts",
  },
];

export default function HealthScreen() {
  const calorieProgress =
    (healthSummary.calories.consumed / healthSummary.calories.goal) * 100;

  // Real habits data
  const {
    todayHabits,
    completedToday,
    completionRate,
    totalStreak,
    isHydrated,
    isLoading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    isCompletedToday,
  } = useHabits();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedHabit, setSelectedHabit] = useState<Habit | undefined>(
    undefined,
  );

  const handleAddPress = () => {
    setModalMode("create");
    setSelectedHabit(undefined);
    setIsModalVisible(true);
  };

  const handleEditPress = (habit: Habit) => {
    setModalMode("edit");
    setSelectedHabit(habit);
    setIsModalVisible(true);
  };

  const handleModalSubmit = (data: CreateHabitInput) => {
    if (modalMode === "edit" && selectedHabit) {
      updateHabit(selectedHabit.id, data);
    } else {
      addHabit(data);
    }
    setIsModalVisible(false);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedHabit(undefined);
  };

  return (
    <Screen scrollable padded>
      {/* Header */}
      <SectionHeader title="Health" subtitle="Your wellness journey" />

      {/* Habits Summary */}
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: Colors.purple + "15" },
            ]}
          >
            <Flame size={22} color={Colors.purple} />
          </View>
          <View style={styles.summaryTitle}>
            <Text variant="body" style={styles.summaryLabel}>
              Habits
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              {isHydrated ? `${totalStreak} day total streak` : "Loading..."}
            </Text>
          </View>
          <Text variant="subheading" style={styles.summaryValue}>
            {isHydrated
              ? `${completedToday.length}/${todayHabits.length}`
              : "-/-"}
          </Text>
        </View>
        <ProgressBar
          progress={isHydrated ? completionRate : 0}
          height={8}
          variant="gradient"
        />
      </Card>

      {/* Today's Habits List */}
      <SectionHeader title="Today's Habits" />

      {isLoading && (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text variant="body" color={Colors.textSecondary}>
            Loading your habits...
          </Text>
        </Card>
      )}

      {!isLoading && todayHabits.length === 0 && (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text
            variant="body"
            color={Colors.textSecondary}
            style={styles.emptyTitle}
          >
            No habits yet
          </Text>
          <Text variant="caption" color={Colors.textTertiary}>
            Add a gentle routine to get started
          </Text>
        </Card>
      )}

      <View style={styles.habitList}>
        {todayHabits.map((habit) => (
          <HabitListItem
            key={habit.id}
            habit={habit}
            isCompleted={isCompletedToday(habit)}
            onToggle={() => toggleHabit(habit.id)}
            onEdit={() => handleEditPress(habit)}
            onDelete={() => deleteHabit(habit.id)}
          />
        ))}
      </View>

      {/* Add Habit Button */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={handleAddPress}
        accessibilityLabel="Add new habit"
        accessibilityRole="button"
      >
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
            Add Habit
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Habit Form Modal */}
      <HabitFormModal
        visible={isModalVisible}
        mode={modalMode}
        initialHabit={selectedHabit}
        onSubmit={handleModalSubmit}
        onClose={handleModalClose}
      />

      {/* Calories Summary */}
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: Colors.pink + "15" },
            ]}
          >
            <Utensils size={22} color={Colors.pink} />
          </View>
          <View style={styles.summaryTitle}>
            <Text variant="body" style={styles.summaryLabel}>
              Calories
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              Today
            </Text>
          </View>
          <Text variant="subheading" style={styles.summaryValue}>
            {healthSummary.calories.consumed}
          </Text>
        </View>
        <ProgressBar progress={calorieProgress} height={8} variant="default" />
        <Text
          variant="caption"
          color={Colors.textSecondary}
          style={styles.goalText}
        >
          Goal: {healthSummary.calories.goal} kcal
        </Text>
      </Card>

      {/* Weight Summary */}
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: Colors.primary + "15" },
            ]}
          >
            <Scale size={22} color={Colors.primary} />
          </View>
          <View style={styles.summaryTitle}>
            <Text variant="body" style={styles.summaryLabel}>
              Weight
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              Current
            </Text>
          </View>
          <View style={styles.weightValue}>
            <Text variant="subheading" style={styles.summaryValue}>
              {healthSummary.weight.current} {healthSummary.weight.unit}
            </Text>
            <View style={styles.changeBadge}>
              <TrendingDown size={14} color={Colors.success} />
              <Text variant="small" color={Colors.success}>
                {healthSummary.weight.change} lbs
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Workout Summary */}
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: Colors.warning + "15" },
            ]}
          >
            <Dumbbell size={22} color={Colors.warning} />
          </View>
          <View style={styles.summaryTitle}>
            <Text variant="body" style={styles.summaryLabel}>
              Workouts
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              This week
            </Text>
          </View>
          <View style={styles.weightValue}>
            <Text variant="subheading" style={styles.summaryValue}>
              {healthSummary.workouts.thisWeek}
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              {healthSummary.workouts.caloriesBurned} kcal burned
            </Text>
          </View>
        </View>
      </Card>

      {/* Quick Links */}
      <SectionHeader title="Health Tools" />
      <View style={styles.linksGrid}>
        {healthLinks.map((link) => (
          <TouchableOpacity
            key={link.title}
            onPress={() => router.push(link.route as any)}
            activeOpacity={0.7}
          >
            <Card variant="elevated" style={styles.linkCard}>
              <View
                style={[
                  styles.linkIcon,
                  { backgroundColor: link.color + "15" },
                ]}
              >
                <link.icon size={20} color={link.color} />
              </View>
              <Text variant="body" style={styles.linkTitle}>
                {link.title}
              </Text>
              <ArrowRight size={16} color={Colors.textTertiary} />
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Encouragement Card */}
      <Card variant="gradient" style={styles.encouragementCard}>
        <View style={styles.encouragementContent}>
          <Heart size={20} color={Colors.textInverse} />
          <Text
            variant="body"
            color={Colors.textInverse}
            style={styles.encouragementText}
          >
            Your body appreciates every healthy choice you make
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  summaryLabel: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontWeight: "600",
  },
  weightValue: {
    alignItems: "flex-end",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.success + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: Spacing.xs,
  },
  goalText: {
    marginTop: Spacing.sm,
  },
  linksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  linkCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  linkTitle: {
    flex: 1,
    fontWeight: "500",
  },
  encouragementCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  encouragementContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  encouragementText: {
    flex: 1,
    fontWeight: "500",
  },
  habitList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addButton: {
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
  emptyCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
  },
});
