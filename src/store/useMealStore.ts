import { create } from 'zustand';

export interface Meal {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  createdAt: string;
  updatedAt: string;
}

type MealState = {
  meals: Meal[];
  isLoading: boolean;
  error: string | null;
};

type MealActions = {
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  setMeals: (meals: Meal[]) => void;
  clearMeals: () => void;
  setError: (error: string | null) => void;
};

type MealStore = MealState & MealActions;

export const useMealStore = create<MealStore>((set) => ({
  meals: [],
  isLoading: false,
  error: null,

  addMeal: (mealData) =>
    set((state) => ({
      meals: [
        ...state.meals,
        {
          ...mealData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateMeal: (id, updates) =>
    set((state) => ({
      meals: state.meals.map((meal) =>
        meal.id === id
          ? { ...meal, ...updates, updatedAt: new Date().toISOString() }
          : meal
      ),
    })),

  deleteMeal: (id) =>
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== id),
    })),

  setMeals: (meals) => set({ meals }),

  clearMeals: () => set({ meals: [] }),

  setError: (error) => set({ error }),
}));
