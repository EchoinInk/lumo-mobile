import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { seedMockTasks } from '../mock/mockTasks';

/**
 * Task Hook
 * 
 * Thin hook abstraction for screens and components.
 * Connects the store to UI with derived selectors.
 * 
 * Responsibilities:
 * - Connect store to UI
 * - Derive lightweight selectors
 * - Avoid logic duplication
 * 
 * Hook MUST NOT:
 * - Contain business logic
 * - Directly access storage
 * - Manage UI filters (use local state)
 */
export function useTasks() {
  const {
    tasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTaskStore();

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Seed mock data if empty (development only)
  useEffect(() => {
    if (tasks.length === 0 && !isLoading) {
      seedMockTasks().then(() => {
        loadTasks();
      });
    }
  }, [tasks.length, isLoading]);

  // Derived selectors
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const highPriorityTasks = tasks.filter((task) => task.priority === 'high');
  const mediumPriorityTasks = tasks.filter((task) => task.priority === 'medium');
  const lowPriorityTasks = tasks.filter((task) => task.priority === 'low');

  const activeCount = activeTasks.length;
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  return {
    // State
    tasks,
    isLoading,
    error,
    
    // Derived data
    activeTasks,
    completedTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    activeCount,
    completedCount,
    totalCount,
    completionPercentage,
    
    // Actions
    loadTasks,
    createTask: async (input: CreateTaskInput) => {
      return await createTask(input);
    },
    updateTask: async (id: string, input: UpdateTaskInput) => {
      return await updateTask(id, input);
    },
    deleteTask: async (id: string) => {
      await deleteTask(id);
    },
    toggleTask: async (id: string) => {
      return await toggleTask(id);
    },
  };
}
