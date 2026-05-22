import { create } from "zustand";

export interface Meal {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
  createdAt: string;
  updatedAt: string;
  /** Soft delete timestamp for sync — null if not deleted */
  deletedAt?: string | null;
  /** Sync status: pending = local changes not synced, synced = confirmed on server, failed = sync failed */
  syncStatus?: "pending" | "synced" | "failed";
  /** Monotonically increasing version for conflict detection */
  version?: number;
  /** ISO timestamp of last successful sync for this entity */
  lastSyncedAt?: string;
  /** True when entity has unsynced local changes */
  pendingSync?: boolean;
}

type MealState = {
  meals: Meal[];
  isLoading: boolean;
  error: string | null;
};

type MealActions = {
  addMeal: (
    meal: Omit<
      Meal,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "syncStatus"
      | "version"
      | "lastSyncedAt"
      | "pendingSync"
    >,
  ) => void;
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
          version: 1,
          pendingSync: true,
        },
      ],
    })),

  updateMeal: (id, updates) =>
    set((state) => ({
      meals: state.meals.map((meal) =>
        meal.id === id
          ? {
              ...meal,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: (meal.version ?? 0) + 1,
              pendingSync: true,
            }
          : meal,
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
