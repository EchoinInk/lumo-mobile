import { CalmPlaceholderNote } from "@/src/components/ui/CalmPlaceholderNote";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Text } from "@/src/components/ui/Text";
import { useTasks } from "@/src/features/tasks";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function buildVisibleWeek(anchor = new Date()) {
  const start = new Date(anchor);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);

  const todayKey = toDateKey(anchor);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKey(date);
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
      date: String(date.getDate()),
      dateKey,
      isToday: dateKey === todayKey,
    };
  });
}

export default function CalendarScreen() {
  const weekDays = buildVisibleWeek();
  const today = weekDays.find((item) => item.isToday) ?? weekDays[0];
  const [selectedDate, setSelectedDate] = useState(today.dateKey);
  const { tasks } = useTasks();
  const selectedTasks = tasks.filter(
    (task) => !task.deletedAt && task.dueDate === selectedDate,
  );
  const selectedLabel =
    selectedDate === today.dateKey
      ? "Today's schedule"
      : new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        });

  return (
    <Screen scrollable padded>
      <SectionHeader
        title="Schedule"
        subtitle="A calm view of your day"
        rightElement={
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
            >
              <ChevronLeft size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              accessibilityRole="button"
              accessibilityLabel="Next week"
            >
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.calendarButton}
              accessibilityRole="button"
              accessibilityLabel="Open calendar view"
            >
              <CalendarIcon size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <Card variant="elevated" style={styles.weekStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStripContent}
        >
          {weekDays.map((item, index) => {
            const isSelected = selectedDate === item.dateKey;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(item.dateKey)}
                style={[
                  styles.dayItem,
                  item.isToday && styles.dayItemToday,
                  isSelected && styles.dayItemSelected,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${item.day} ${item.date}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  variant="caption"
                  color={
                    item.isToday || isSelected
                      ? Colors.textInverse
                      : Colors.textSecondary
                  }
                >
                  {item.day}
                </Text>
                <Text
                  variant="body"
                  color={
                    item.isToday || isSelected
                      ? Colors.textInverse
                      : Colors.textPrimary
                  }
                  style={styles.dayDate}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Card>

      <SectionHeader title={selectedLabel} />
      {selectedTasks.length > 0 ? (
        <View style={styles.taskList}>
          {selectedTasks.map((task) => (
            <Card key={task.id} variant="outlined" style={styles.taskCard}>
              <Text variant="body" style={styles.taskTitle}>
                {task.title}
              </Text>
              <Text variant="caption" color={Colors.textTertiary}>
                {task.dueTime ? `At ${task.dueTime}` : "Scheduled task"}
              </Text>
            </Card>
          ))}
        </View>
      ) : (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text variant="body" color={Colors.textSecondary}>
            Nothing needs your attention here yet.
          </Text>
          <Text variant="caption" color={Colors.textTertiary}>
            Tasks with this date will appear here.
          </Text>
        </Card>
      )}

      <CalmPlaceholderNote
        title="This space is coming together."
        description="You can come back to this later."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  controlButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lavender,
    borderRadius: Radius.md,
    marginLeft: Spacing.xs,
  },
  weekStrip: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  weekStripContent: {
    gap: Spacing.sm,
  },
  dayItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    minWidth: 48,
    minHeight: 44,
  },
  dayItemToday: {
    backgroundColor: Colors.pink,
  },
  dayItemSelected: {
    backgroundColor: Colors.primary,
  },
  dayDate: {
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
  emptyCard: {
    gap: Spacing.xs,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  taskList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  taskCard: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  taskTitle: {
    fontWeight: "600",
  },
});
