import { create } from 'zustand';

interface MealState {
  meals: [];
  // Add meal-related state and actions here
}

export const useMealStore = create<MealState>(() => ({
  meals: [],
}));
