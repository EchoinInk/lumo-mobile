import { create } from 'zustand';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { taskLocalRepository } from '../services/taskLocalRepository';

/**
 * Task Store State
 */
type TaskState = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};

/**
 * Task Store Actions
 */
type TaskActions = {
  loadTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<Task>;
  setError: (error: string | null) => void;
};

/**
 * Task Store
 * 
 * Domain-specific Zustand store for task state management.
 * Orchestrates repository calls and maintains UI-safe state.
 * 
 * Responsibilities:
 * - Orchestrate repository calls
 * - Maintain UI-safe state (tasks, loading, error)
 * - Expose actions for UI components
 * 
 * Store MUST NOT:
 * - Directly use MMKV
 * - Contain serialization logic
 * - Manage UI filters or modals
 */
type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  error: null,

  // Actions
  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskLocalRepository.getTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load tasks',
        isLoading: false,
      });
    }
  },

  createTask: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await taskLocalRepository.createTask(input);
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
      return newTask;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTask: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskLocalRepository.updateTask(id, input);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await taskLocalRepository.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskLocalRepository.toggleTask(id);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle task',
        isLoading: false,
      });
      throw error;
    }
  },

  setError: (error) => set({ error }),
}));
