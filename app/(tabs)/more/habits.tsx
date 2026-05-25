import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { MoreScreenHeader } from "@/src/features/more/components";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { CheckCircle2, Flame } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock habits data
const mockHabits = [
  {
    id: "1",
    name: "Morning Meditation",
    streak: 7,
    progress: 100,
    completed: true,
  },
  { id: "2", name: "Exercise", streak: 5, progress: 71, completed: false },
  { id: "3", name: "Reading", streak: 12, progress: 85, completed: true },
  { id: "4", name: "Journaling", streak: 3, progress: 43, completed: false },
];

export default function HabitsScreen() {
  const completedCount = mockHabits.filter((h) => h.completed).length;

  return (
    <Screen scrollable padded>
      <MoreScreenHeader title="My Habits" subtitle="Daily Tracking" />

      {/* Stats Summary */}
      <Card variant="gradient" style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text variant="caption" color={Colors.textInverse}>
            This Week
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text variant="heading" color={Colors.textInverse}>
                27
              </Text>
              <Text variant="caption" color={Colors.textInverse}>
                Completed
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text variant="heading" color={Colors.textInverse}>
                85%
              </Text>
              <Text variant="caption" color={Colors.textInverse}>
                Success Rate
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Habits List */}
      <SectionHeader
        title={`Today's Habits (${completedCount}/${mockHabits.length})`}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.habitsList}
      >
        {mockHabits.map((habit) => (
          <Card key={habit.id} variant="elevated" style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <View style={styles.habitLeft}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    habit.completed && styles.checkboxChecked,
                  ]}
                >
                  {habit.completed && (
                    <CheckCircle2 size={18} color={Colors.textInverse} />
                  )}
                </TouchableOpacity>
                <Text variant="body" style={styles.habitName}>
                  {habit.name}
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Flame size={14} color={Colors.purple} />
                <Text variant="caption" color={Colors.purple}>
                  {habit.streak}
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={habit.progress}
              height={6}
              variant="gradient"
            />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  summaryContent: {
    alignItems: "center",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: Spacing.md,
  },
  summaryStat: {
    alignItems: "center",
  },
  habitsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  habitCard: {
    padding: Spacing.md,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  habitLeft: {
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
  habitName: {
    fontWeight: "500",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.purple + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
});
