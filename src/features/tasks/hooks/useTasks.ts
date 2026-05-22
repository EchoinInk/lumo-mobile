import { useEffect } from "react";
import { mockTasks } from "../mock/mockTasks";
import { useTaskStore } from "../store/useTaskStore";
import { CreateTaskInput, UpdateTaskInput } from "../types/task";

/**
 * Task Hook
 *
 * Thin hook abstraction for screens and components.
 * Connects the store to UI with derived selectors.
 */
export function useTasks() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useTaskStore();

  // Seed mock data on first mount if store is empty
  useEffect(() => {
    if (tasks.length === 0) {
      for (const task of mockTasks) {
        addTask({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
        });
      }
    }
  }, []);

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
