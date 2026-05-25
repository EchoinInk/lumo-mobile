import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { MoreScreenHeader } from "@/src/features/more/components";
import { Colors, Radius, Shadows, Spacing } from "@/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { Dumbbell, Plus, Timer } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock workout history
const mockWorkouts = [
  {
    id: "1",
    name: "Morning Run",
    duration: "30 min",
    calories: 280,
    type: "Cardio",
  },
  {
    id: "2",
    name: "Upper Body",
    duration: "45 min",
    calories: 200,
    type: "Strength",
  },
  {
    id: "3",
    name: "Yoga Flow",
    duration: "20 min",
    calories: 120,
    type: "Flexibility",
  },
];

export default function WorkoutsScreen() {
  return (
    <Screen scrollable padded>
      <MoreScreenHeader title="My Workout Log" subtitle="This Week" />

      {/* Weekly Summary Card */}
      <Card variant="gradient" style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text variant="caption" color={Colors.textInverse}>
            Weekly Activity
          </Text>
          <Text variant="heading" color={Colors.textInverse}>
            3 Workouts
          </Text>
          <Text variant="body" color={Colors.textInverse}>
            600 calories burned
          </Text>
        </View>
      </Card>

      {/* Workouts List */}
      <SectionHeader title="Recent Workouts" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockWorkouts.map((workout) => (
          <Card key={workout.id} variant="elevated" style={styles.workoutCard}>
            <View style={styles.workoutContent}>
              <View style={styles.workoutIconContainer}>
                <Dumbbell size={20} color={Colors.pink} />
              </View>
              <View style={styles.workoutInfo}>
                <Text variant="body" style={styles.workoutName}>
                  {workout.name}
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  {workout.type}
                </Text>
              </View>
              <View style={styles.workoutStats}>
                <View style={styles.stat}>
                  <Timer size={14} color={Colors.textSecondary} />
                  <Text variant="caption" color={Colors.textSecondary}>
                    {workout.duration}
                  </Text>
                </View>
                <Text variant="caption" style={styles.calories}>
                  {workout.calories} kcal
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
            Log Workout
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  summaryContent: {
    alignItems: "center",
  },
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  workoutCard: {
    padding: Spacing.md,
  },
  workoutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  workoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.pink + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  workoutStats: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  calories: {
    color: Colors.pink,
    fontWeight: "500",
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
