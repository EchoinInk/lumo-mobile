import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createPersistStorage } from "./createPersistStorage";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  targetDays: number[];
  completedDates: string[];
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  /** Soft delete timestamp for sync — null if not deleted */
  deletedAt?: string | null;
  /** Sync status: pending = local changes not synced, synced = confirmed on server */
  syncStatus?: "pending" | "synced" | "failed";
  /** Monotonically increasing version for conflict detection */
  version?: number;
  /** ISO timestamp of last successful sync for this entity */
  lastSyncedAt?: string;
  /** True when entity has unsynced local changes */
  pendingSync?: boolean;
}

type HabitState = {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
};

type HabitActions = {
  addHabit: (
    habit: Omit<
      Habit,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "completedDates"
      | "deletedAt"
      | "syncStatus"
      | "version"
      | "lastSyncedAt"
      | "pendingSync"
    >,
  ) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  setHabits: (habits: Habit[]) => void;
  clearHabits: () => void;
  setError: (error: string | null) => void;
};

type HabitStore = HabitState & HabitActions;

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      isLoading: false,
      error: null,

      addHabit: (habitData) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habitData,
              id: crypto.randomUUID(),
              completedDates: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1,
              pendingSync: true,
            },
          ],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  version: (habit.version ?? 0) + 1,
                  pendingSync: true,
                }
              : habit,
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      toggleHabitCompletion: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  completedDates: habit.completedDates.includes(date)
                    ? habit.completedDates.filter((d) => d !== date)
                    : [...habit.completedDates, date],
                  updatedAt: new Date().toISOString(),
                  version: (habit.version ?? 0) + 1,
                  pendingSync: true,
                }
              : habit,
          ),
        })),

      setHabits: (habits) => set({ habits }),

      clearHabits: () => set({ habits: [] }),

      setError: (error) => set({ error }),
    }),
    {
      name: "habit-storage",
      storage: createJSONStorage(() => createPersistStorage()),
    },
  ),
);
