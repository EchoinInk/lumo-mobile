import { create } from 'zustand';
import { observability } from '@/services/observability';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  lastSyncedAt?: string;
  pendingSync?: boolean;
}

type TaskState = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};

type TaskActions = {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'lastSyncedAt' | 'pendingSync'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  clearTasks: () => void;
  setError: (error: string | null) => void;
};

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  addTask: (taskData) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          pendingSync: true,
        },
      ],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString(), version: (task.version ?? 0) + 1, pendingSync: true }
          : task
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  toggleTaskCompletion: (id) => {
    let completed = false;

    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        completed = !task.completed;
        return {
          ...task,
          completed,
          updatedAt: new Date().toISOString(),
          version: (task.version ?? 0) + 1,
          pendingSync: true,
        };
      }),
    }));

    if (completed) {
      observability.analytics.track('task_completed');
    }
  },

  setTasks: (tasks) => set({ tasks }),

  clearTasks: () => set({ tasks: [] }),

  setError: (error) => set({ error }),
}));
