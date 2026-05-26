/**
 * Onboarding Store
 *
 * Zustand store for managing onboarding state and progress.
 * Lightweight persistence with MMKV.
 */

import type {
    DashboardPersonalization,
    FocusArea,
    OnboardingData,
    PlanningPreference,
    StruggleArea,
} from "@/types/onboarding";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createPersistStorage } from "./createPersistStorage";

type OnboardingState = {
  data: OnboardingData;
  personalization: DashboardPersonalization;
  isLoading: boolean;
  error: string | null;
};

type OnboardingActions = {
  setStruggleAreas: (areas: StruggleArea[]) => void;
  setPlanningPreference: (preference: PlanningPreference) => void;
  setFocusAreas: (areas: FocusArea[]) => void;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updatePersonalization: (updates: Partial<DashboardPersonalization>) => void;
  setError: (error: string | null) => void;
};

const defaultOnboardingData: OnboardingData = {
  struggleAreas: [],
  planningPreference: "minimal",
  focusAreas: [],
  completedAt: null,
  currentStep: 1,
};

const defaultPersonalization: DashboardPersonalization = {
  showHabits: true,
  showTasks: true,
  showMeals: false,
  showWellness: false,
  showFitness: false,
  dashboardDensity: "standard",
  cardStyle: "comfortable",
};

type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      data: defaultOnboardingData,
      personalization: defaultPersonalization,
      isLoading: false,
      error: null,

      setStruggleAreas: (areas) =>
        set((state) => ({
          data: { ...state.data, struggleAreas: areas },
        })),

      setPlanningPreference: (preference) =>
        set((state) => ({
          data: { ...state.data, planningPreference: preference },
        })),

      setFocusAreas: (areas) =>
        set((state) => ({
          data: { ...state.data, focusAreas: areas },
        })),

      setCurrentStep: (step) =>
        set((state) => ({
          data: { ...state.data, currentStep: step },
        })),

      completeOnboarding: () =>
        set((state) => ({
          data: {
            ...state.data,
            completedAt: new Date().toISOString(),
            currentStep: 4,
          },
        })),

      resetOnboarding: () =>
        set({
          data: defaultOnboardingData,
          personalization: defaultPersonalization,
        }),

      updatePersonalization: (updates) =>
        set((state) => ({
          personalization: { ...state.personalization, ...updates },
        })),

      setError: (error) => set({ error }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => createPersistStorage()),
    },
  ),
);
