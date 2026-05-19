import { AppFlashList } from '@/components/lists/AppFlashList';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Spacing } from '@/theme/tokens';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Task } from '../types/task';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  onToggleTask?: (id: string) => void;
  onPressTask?: (task: Task) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function TaskList({
  tasks,
  onToggleTask,
  onPressTask,
  emptyMessage = 'No tasks found',
  isLoading = false,
}: TaskListProps) {
  const renderItem = useStableCallback(({ item }: { item: Task }) => {
    return (
      <TaskRow
        task={item}
        onToggle={onToggleTask}
        onPress={onPressTask}
      />
    );
  }, [onToggleTask, onPressTask]);

  const keyExtractor = useStableCallback((item: Task) => item.id, []);

  return (
    <AppFlashList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={96}
      emptyStateMessage={emptyMessage}
      isLoading={isLoading}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: Spacing.xl,
  },
});
