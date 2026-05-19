import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from './createPersistStorage';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays: number[];
  completedDates: string[];
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

type HabitState = {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
};

type HabitActions = {
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => void;
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
            },
          ],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
              : habit
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
                }
              : habit
          ),
        })),

      setHabits: (habits) => set({ habits }),

      clearHabits: () => set({ habits: [] }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => createPersistStorage('habits')),
    }
  )
);
