import { create } from 'zustand';

interface HabitState {
  habits: [];
  // Add habit-related state and actions here
}

export const useHabitStore = create<HabitState>(() => ({
  habits: [],
}));
