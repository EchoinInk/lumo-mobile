import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { Task } from "@/src/features/tasks/types/task";
import { Colors, Radius, Spacing } from "@/src/theme/tokens";
import { CheckCircle2, Circle } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface TodayFocusCardProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddPress: () => void;
  emptyMessage?: string;
}

const priorityColors: Record<string, string> = {
  high: Colors.pink,
  medium: Colors.warning,
  low: Colors.blue,
};

export function TodayFocusCard({
  tasks,
  onToggle,
  onAddPress,
  emptyMessage = "Nothing urgent here. You can add one small step when you're ready.",
}: TodayFocusCardProps) {
  if (tasks.length === 0) {
    return (
      <Card variant="outlined" style={styles.emptyCard}>
        <Text
          variant="body"
          color={Colors.textSecondary}
          style={styles.emptyText}
        >
          {emptyMessage}
        </Text>
        <TouchableOpacity onPress={onAddPress} activeOpacity={0.7}>
          <Text variant="caption" color={Colors.purple}>
            Add a task →
          </Text>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.card}>
      <Text variant="subheading" style={styles.title}>
        Today's Focus
      </Text>

      <View style={styles.taskList}>
        {tasks.slice(0, 4).map((task) => {
          const isCompleted = task.completed;
          const priorityColor =
            priorityColors[task.priority] || Colors.textSecondary;

          return (
            <TouchableOpacity
              key={task.id}
              style={styles.taskRow}
              onPress={() => onToggle(task.id)}
              activeOpacity={0.7}
              accessibilityLabel={`${isCompleted ? "Completed" : "Pending"} task: ${task.title}`}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.checkbox,
                  isCompleted && styles.checkboxChecked,
                  !isCompleted &&
                    task.priority === "high" && {
                      borderColor: priorityColor,
                      backgroundColor: priorityColor + "10",
                    },
                ]}
              >
                {isCompleted ? (
                  <CheckCircle2 size={18} color={Colors.textInverse} />
                ) : (
                  <Circle
                    size={18}
                    color={isCompleted ? Colors.border : priorityColor}
                  />
                )}
              </View>

              <View style={styles.taskInfo}>
                <Text
                  variant="body"
                  style={[
                    styles.taskTitle,
                    isCompleted && styles.taskTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {tasks.length > 4 && (
        <TouchableOpacity
          onPress={onAddPress}
          activeOpacity={0.7}
          style={styles.moreLink}
        >
          <Text variant="caption" color={Colors.textSecondary}>
            + {tasks.length - 4} more tasks
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
  taskList: {
    gap: Spacing.sm,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
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
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: "500",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  moreLink: {
    marginTop: Spacing.sm,
    alignItems: "center",
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
});
