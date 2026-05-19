import { Screen } from '@/components/ui/Screen';
import React, { useState } from 'react';
import { AddTaskButton } from '../components/AddTaskButton';
import { EmptyTasks } from '../components/EmptyTasks';
import { TaskFilterPills } from '../components/TaskFilterPills';
import { TaskList } from '../components/TaskList';
import { TaskSection } from '../components/TaskSection';
import { useTasks } from '../hooks/useTasks';
import { TaskFilter } from '../types/task';
import { filterTasks } from '../utils/taskHelpers';

/**
 * Tasks Screen
 * 
 * Thin orchestration-only screen.
 * Delegates to components, hooks, and utilities.
 * 
 * Responsibilities:
 * - Orchestrate component composition
 * - Manage UI-only state (filters)
 * - Connect hooks to components
 * 
 * Screen MUST NOT:
 * - Contain business logic
 * - Directly access repositories
 * - Manage domain state
 */
export default function TasksScreen() {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const {
    tasks,
    isLoading,
    activeCount,
    completedCount,
    toggleTask,
  } = useTasks();

  // Filter tasks using utility helper
  const filteredTasks = React.useMemo(() => {
    return filterTasks(tasks, filter);
  }, [tasks, filter]);

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handlePressTask = (task: any) => {
    // TODO: Navigate to task detail
    console.log('Task pressed:', task.id);
  };

  return (
    <Screen scrollable padded>
      {/* Header Section */}
      <TaskSection 
        title="Tasks" 
        subtitle={`${activeCount} active, ${completedCount} completed`}
      >
        {/* Filter Pills */}
        <TaskFilterPills 
          selectedFilter={filter}
          onFilterChange={setFilter}
        />

        {/* Task List */}
        {!isLoading && filteredTasks.length > 0 ? (
          <TaskList 
            tasks={filteredTasks}
            onToggleTask={handleToggleTask}
            onPressTask={handlePressTask}
          />
        ) : (
          <EmptyTasks filter={filter} />
        )}
      </TaskSection>

      {/* Add Task Button */}
      <AddTaskButton />
    </Screen>
  );
}
