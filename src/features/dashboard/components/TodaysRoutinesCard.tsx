import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { Habit } from "@/src/features/habits/types/habit";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { CheckCircle2, Circle, Flame } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface TodaysRoutinesCardProps {
  habits: Habit[];
  completedIds: string[];
  onToggle: (id: string) => void;
  onAddPress: () => void;
  emptyMessage?: string;
}

const colorMap: Record<string, string> = {
  blue: Colors.blue,
  green: Colors.success,
  yellow: Colors.warning,
  orange: Colors.warning,
  pink: Colors.pink,
  purple: Colors.purple,
  teal: Colors.info,
};

export function TodaysRoutinesCard({
  habits,
  completedIds,
  onToggle,
  onAddPress,
  emptyMessage = "A gentle routine can help anchor the day.",
}: TodaysRoutinesCardProps) {
  if (habits.length === 0) {
    return (
      <Card variant="outlined" style={styles.emptyCard}>
        <Text variant="body" color={Colors.textSecondary} style={styles.emptyText}>
          {emptyMessage}
        </Text>
        <TouchableOpacity
          onPress={onAddPress}
          activeOpacity={0.7}
          style={styles.linkButton}
          accessibilityRole="button"
          accessibilityLabel="Add a routine"
          accessibilityHint="Opens routines so you can add a gentle anchor"
        >
          <Text variant="caption" color={Colors.purple}>
            Add a routine →
          </Text>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.card}>
      <Text variant="subheading" style={styles.title}>
        Today's Routines
      </Text>

      <View style={styles.habitList}>
        {habits.slice(0, 4).map((habit) => {
          const isCompleted = completedIds.includes(habit.id);
          const habitColor = colorMap[habit.color || "blue"];

          return (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitRow}
              onPress={() => onToggle(habit.id)}
              activeOpacity={0.7}
              accessibilityLabel={`${isCompleted ? "Completed" : "Pending"} habit: ${habit.title}`}
              accessibilityRole="button"
              accessibilityHint="Toggles this routine's completion state"
            >
              <View
                style={[
                  styles.checkbox,
                  isCompleted && styles.checkboxChecked,
                  !isCompleted && { borderColor: habitColor },
                ]}
              >
                {isCompleted ? (
                  <CheckCircle2 size={18} color={Colors.textInverse} />
                ) : (
                  <Circle size={18} color={habitColor} />
                )}
              </View>

              <View style={styles.habitInfo}>
                <Text
                  variant="body"
                  style={[
                    styles.habitTitle,
                    isCompleted && styles.habitTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {habit.title}
                </Text>
              </View>

              {habit.streakCount > 0 && (
                <View style={styles.streakBadge}>
                  <Flame size={12} color={Colors.warning} />
                  <Text variant="small" color={Colors.warning}>
                    {habit.streakCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {habits.length > 4 && (
        <TouchableOpacity
          onPress={onAddPress}
          activeOpacity={0.7}
          style={styles.moreLink}
          accessibilityRole="button"
          accessibilityLabel={`View ${habits.length - 4} more routines`}
          accessibilityHint="Opens the routines screen"
        >
          <Text variant="caption" color={Colors.textSecondary}>
            + {habits.length - 4} more routines
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  habitList: {
    gap: Spacing.sm,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
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
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontWeight: "500",
  },
  habitTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.warning + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  moreLink: {
    marginTop: Spacing.sm,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  emptyCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
  linkButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
});
