import {
    dispatchTaskCreated,
    dispatchTaskDeleted,
    dispatchTaskToggled,
    dispatchTaskUpdated,
} from "@/services/sync/syncDispatcher";
import { create } from "zustand";
import { mockTasks } from "../mock/mockTasks";
import { taskLocalRepository } from "../services/taskLocalRepository";
import { CreateTaskInput, Task, UpdateTaskInput } from "../types/task";

type TaskState = {
  tasks: Task[];
  hasHydrated: boolean;
};

type TaskActions = {
  // Hydration
  hydrateTasks: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;

  // Mutations (UI updates immediately, persists in background)
  addTask: (input: CreateTaskInput) => Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void; // Soft delete
  updateTask: (id: string, input: UpdateTaskInput) => void;

  // Direct state manipulation (for hydration/seed)
  setTasks: (tasks: Task[]) => void;
};

type TaskStore = TaskState & TaskActions;

/**
 * Task Store
 *
 * Local-first persisted Zustand store for task state management.
 * - UI updates instantly (never blocked)
 * - Persistence happens in background via taskLocalRepository
 * - Sync events dispatched via Sync Dispatcher
 * - Hydrates from MMKV on initialization
 * - Seeds mock data if storage is empty
 * - Soft delete architecture (deletedAt timestamp)
 *
 * Architecture:
 *   UI → Store → Repository → MMKV
 *                  ↓
 *            Sync Dispatcher → Queue
 */
export const useTaskStore = create<TaskStore>((set, get) => ({
  // ── Initial State ────────────────────────────────────────────────────────
  tasks: [],
  hasHydrated: false,

  // ── Hydration ────────────────────────────────────────────────────────────
  hydrateTasks: async () => {
    // Load from local storage
    const storedTasks = await taskLocalRepository.getTasks();

    if (storedTasks.length > 0) {
      // Use stored tasks
      set({ tasks: storedTasks, hasHydrated: true });
    } else {
      // Seed with mock tasks and persist them
      const seededTasks = mockTasks.map((task) => ({
        ...task,
        version: 1,
        pendingSync: false,
        syncStatus: "synced" as const,
      }));

      set({ tasks: seededTasks, hasHydrated: true });

      // Persist seeded tasks in background
      try {
        for (const task of seededTasks) {
          await taskLocalRepository.createTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
          });
        }
      } catch (err) {
        console.error("[TaskStore] Failed to persist seeded tasks:", err);
      }
    }
  },

  setHasHydrated: (value) => set({ hasHydrated: value }),

  setTasks: (tasks) => set({ tasks }),

  // ── Mutations (Instant UI + Background Persistence) ─────────────────────

  addTask: (input) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`,
      title: input.title,
      description: input.description,
      completed: false,
      priority: input.priority,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
      version: 1,
      pendingSync: true,
      syncStatus: "pending",
    };

    // Update UI immediately
    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }));

    // Persist in background (non-blocking)
    taskLocalRepository
      .createTask(input)
      .then((persistedTask) => {
        // Dispatch sync event after successful persistence
        dispatchTaskCreated(persistedTask.id, {
          title: persistedTask.title,
          priority: persistedTask.priority,
        });
      })
      .catch((err) => {
        console.error("[TaskStore] Failed to persist new task:", err);
      });

    return newTask;
  },

  toggleTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date().toISOString(),
      version: (task.version ?? 0) + 1,
      pendingSync: true,
      syncStatus: "pending",
    };

    // Update UI immediately
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
    }));

    // Persist in background (non-blocking)
    taskLocalRepository
      .toggleTask(id)
      .then((persistedTask) => {
        // Dispatch sync event after successful persistence
        dispatchTaskToggled(persistedTask.id, persistedTask.completed);
      })
      .catch((err) => {
        console.error("[TaskStore] Failed to persist task toggle:", err);
      });
  },

  deleteTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const now = new Date().toISOString();
    const softDeletedTask: Task = {
      ...task,
      deletedAt: now,
      updatedAt: now,
      version: (task.version ?? 0) + 1,
      pendingSync: true,
      syncStatus: "pending",
    };

    // Update UI immediately (filter out soft-deleted from visible tasks)
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    // Persist soft delete in background (non-blocking)
    taskLocalRepository
      .deleteTask(id)
      .then(() => {
        // Dispatch sync event after successful persistence
        dispatchTaskDeleted(id, now);
      })
      .catch((err) => {
        console.error("[TaskStore] Failed to persist task deletion:", err);
      });
  },

  updateTask: (id, input) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      ...input,
      updatedAt: new Date().toISOString(),
      version: (task.version ?? 0) + 1,
      pendingSync: true,
      syncStatus: "pending",
    };

    // Update UI immediately
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
    }));

    // Persist in background (non-blocking)
    taskLocalRepository
      .updateTask(id, input)
      .then((persistedTask) => {
        // Dispatch sync event after successful persistence
        dispatchTaskUpdated(persistedTask.id, input);
      })
      .catch((err) => {
        console.error("[TaskStore] Failed to persist task update:", err);
      });
  },
}));
