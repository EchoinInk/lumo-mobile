import { useEffect, useState } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { CreateTaskInput, UpdateTaskInput } from "../types/task";

/**
 * Task Hook
 *
 * Thin hook abstraction for screens and components.
 * Connects the store to UI with derived selectors.
 * Handles hydration lifecycle from local storage.
 *
 * Persistence verification:
 * - Tasks are stored in MMKV under StorageKeys.TASKS
 * - All mutations (add/toggle/update/delete) persist immediately
 * - Hydration loads tasks on first mount
 * - Corrupted storage returns empty array (graceful fallback)
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

  // Local error state for UI feedback
  const [error, setError] = useState<string | null>(null);

  // Hydrate from local storage on first mount
  useEffect(() => {
    if (!hasHydrated) {
      hydrateTasks().catch((err) => {
        console.error("[useTasks] Failed to hydrate tasks:", err);
        setError("Unable to load your tasks. They'll appear when ready.");
      });
    }
  }, [hasHydrated, hydrateTasks]);

  // Clear error when tasks update successfully
  useEffect(() => {
    if (tasks.length > 0 || hasHydrated) {
      setError(null);
    }
  }, [tasks, hasHydrated]);

  // Derived selectors
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const activeCount = activeTasks.length;
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Wrapped actions with error handling
  const handleCreateTask = (input: CreateTaskInput) => {
    try {
      return addTask(input);
    } catch (err) {
      console.error("[useTasks] Failed to create task:", err);
      setError("Couldn't save your task. Please try again.");
      return null;
    }
  };

  const handleToggleTask = (id: string) => {
    try {
      toggleTask(id);
    } catch (err) {
      console.error("[useTasks] Failed to toggle task:", err);
      setError("Couldn't update your task. Please try again.");
    }
  };

  const handleDeleteTask = (id: string) => {
    try {
      deleteTask(id);
    } catch (err) {
      console.error("[useTasks] Failed to delete task:", err);
      setError("Couldn't remove your task. Please try again.");
    }
  };

  const handleUpdateTask = (id: string, input: UpdateTaskInput) => {
    try {
      updateTask(id, input);
    } catch (err) {
      console.error("[useTasks] Failed to update task:", err);
      setError("Couldn't update your task. Please try again.");
    }
  };

  return {
    // State
    tasks,
    hasHydrated,
    isLoading: !hasHydrated,
    error,
    clearError: () => setError(null),

    // Derived data
    activeTasks,
    completedTasks,
    activeCount,
    completedCount,
    totalCount,
    completionPercentage,

    // Actions (wrapped with error handling)
    createTask: handleCreateTask,
    toggleTask: handleToggleTask,
    deleteTask: handleDeleteTask,
    updateTask: handleUpdateTask,
  };
}
