import { create } from "zustand";
import { CreateTaskInput, Task, UpdateTaskInput } from "../types/task";

/**
 * Generate a simple unique ID (no crypto dependency)
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

type TaskState = {
  tasks: Task[];
};

type TaskActions = {
  addTask: (input: CreateTaskInput) => Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, input: UpdateTaskInput) => void;
};

type TaskStore = TaskState & TaskActions;

/**
 * Task Store
 *
 * Pure in-memory Zustand store for task state management.
 * No persistence, no async, no backend. Instant updates.
 */
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  addTask: (input) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateId(),
      title: input.title,
      description: input.description,
      completed: false,
      priority: input.priority,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }));

    return newTask;
  },

  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  updateTask: (id, input) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...input, updatedAt: new Date().toISOString() }
          : task,
      ),
    }));
  },
}));
