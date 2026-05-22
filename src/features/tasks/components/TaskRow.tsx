import { Card } from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { Colors, Spacing } from "@/src/theme/tokens";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Task, TaskPriority } from "../types/task";

interface TaskRowProps {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPress?: (task: Task) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  high: Colors.dangerSoft,
  medium: Colors.warningSoft,
  low: Colors.infoSoft,
};

const priorityTextColors: Record<TaskPriority, string> = {
  high: Colors.danger,
  medium: Colors.warning,
  low: Colors.info,
};

export const TaskRow = React.memo<TaskRowProps>(
  ({ task, onToggle, onDelete, onPress }) => {
    const handlePress = React.useCallback(() => {
      onPress?.(task);
    }, [onPress, task]);

    const handleToggle = React.useCallback(() => {
      onToggle?.(task.id);
    }, [onToggle, task.id]);

    const handleDelete = React.useCallback(() => {
      onDelete?.(task.id);
    }, [onDelete, task.id]);

    return (
      <Card variant="elevated" padding="lg">
        <View style={styles.header}>
          <View style={styles.leftContent}>
            <TouchableOpacity
              onPress={handleToggle}
              style={styles.checkbox}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.completed }}
              accessibilityLabel={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
            >
              <View
                style={[
                  styles.checkboxBox,
                  task.completed && styles.checkboxChecked,
                ]}
              >
                {task.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text
                variant="body"
                style={[styles.title, task.completed && styles.completedTitle]}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  variant="caption"
                  color={Colors.textSecondary}
                  style={styles.description}
                  numberOfLines={1}
                >
                  {task.description}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightContent}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColors[task.priority] },
              ]}
            >
              <Text
                variant="small"
                style={[
                  styles.priorityText,
                  { color: priorityTextColors[task.priority] },
                ]}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
            {onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${task.title}`}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {task.dueDate && (
          <Text
            variant="caption"
            color={Colors.textTertiary}
            style={styles.dueDate}
          >
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.title === nextProps.task.title &&
      prevProps.task.description === nextProps.task.description &&
      prevProps.task.completed === nextProps.task.completed &&
      prevProps.task.priority === nextProps.task.priority &&
      prevProps.task.dueDate === nextProps.task.dueDate
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: Spacing.md,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  description: {
    marginTop: Spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  priorityText: {
    fontWeight: "600",
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  dueDate: {
    marginTop: Spacing.sm,
    marginLeft: 36,
  },
});
