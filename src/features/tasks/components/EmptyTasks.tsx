import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyTasksProps {
  filter?: string;
}

export function EmptyTasks({ filter }: EmptyTasksProps) {
  const getTitle = () => {
    if (filter === 'completed') return 'No completed tasks';
    if (filter === 'active') return 'No active tasks';
    if (filter === 'high') return 'No high priority tasks';
    if (filter === 'medium') return 'No medium priority tasks';
    if (filter === 'low') return 'No low priority tasks';
    return 'No tasks yet';
  };

  const getDescription = () => {
    if (filter === 'completed') return 'Completed tasks will appear here';
    if (filter === 'active') return 'All your tasks are completed';
    if (filter) return `No ${filter} tasks found`;
    return 'Tap the + button to add your first task';
  };

  return (
    <EmptyState 
      title={getTitle()}
      description={getDescription()}
    />
  );
}
