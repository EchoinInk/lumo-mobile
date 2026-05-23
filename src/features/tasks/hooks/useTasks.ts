import { useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { CreateTaskInput, UpdateTaskInput } from "../types/task";

/**
 * Task Hook
 *
 * Thin hook abstraction for screens and components.
 * Connects the store to UI with derived selectors.
 * Handles hydration lifecycle from local storage.
 */
export function useTasks() {
  const {
    tasks,
    hasHydrated,
    hydrateTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
  } = useTaskStore();

  // Hydrate from local storage on first mount
  useEffect(() => {
    if (!hasHydrated) {
      hydrateTasks();
    }
  }, [hasHydrated, hydrateTasks]);

  // Derived selectors
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const activeCount = activeTasks.length;
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    // State
    tasks,
    hasHydrated,

    // Derived data
    activeTasks,
    completedTasks,
    activeCount,
    completedCount,
    totalCount,
    completionPercentage,

    // Actions (synchronous, instant)
    createTask: (input: CreateTaskInput) => addTask(input),
    toggleTask: (id: string) => toggleTask(id),
    deleteTask: (id: string) => deleteTask(id),
    updateTask: (id: string, input: UpdateTaskInput) => updateTask(id, input),
  };
}
