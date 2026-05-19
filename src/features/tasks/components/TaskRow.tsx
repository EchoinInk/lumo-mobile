import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Colors, Spacing } from '@/theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Task, TaskPriority } from '../types/task';

interface TaskRowProps {
  task: Task;
  onToggle?: (id: string) => void;
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

export const TaskRow = React.memo<TaskRowProps>(({ task, onToggle, onPress }) => {
  const handlePress = React.useCallback(() => {
    onPress?.(task);
  }, [onPress, task]);

  const handleToggle = React.useCallback(() => {
    onToggle?.(task.id);
  }, [onToggle, task.id]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card variant="elevated" padding="lg" style={styles.container}>
        <View style={styles.header}>
          <View style={styles.leftContent}>
            <TouchableOpacity
              onPress={handleToggle}
              style={styles.checkbox}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxBox, task.completed && styles.checkboxChecked]}>
                {task.completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
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
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColors[task.priority] }
            ]}
          >
            <Text
              variant="small"
              style={[styles.priorityText, { color: priorityTextColors[task.priority] }]}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>
        </View>
        {task.dueDate && (
          <Text variant="caption" color={Colors.textTertiary} style={styles.dueDate}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.dueDate === nextProps.task.dueDate
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: Spacing.md,
  },
  checkbox: {
    marginTop: 2,
    marginRight: Spacing.sm,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  description: {
    marginTop: Spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginLeft: Spacing.sm,
  },
  priorityText: {
    fontWeight: '600',
  },
  dueDate: {
    marginTop: Spacing.sm,
    marginLeft: Spacing['4xl'],
  },
});
