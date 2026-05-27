/**
 * Focus Mode Store
 *
 * Zustand domain store for Focus Mode state management.
 * Uses MMKV persistence following project patterns.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createPersistStorage } from "@/src/store/createPersistStorage";
import type {
    CognitiveDensity,
    FocusModeState,
    FocusSectionKey,
} from "../types/focus.types";

type FocusModeActions = {
  enableFocusMode: (taskId?: string) => void;
  disableFocusMode: () => void;
  setActiveFocusTask: (taskId: string | null) => void;
  toggleSectionVisibility: (sectionKey: FocusSectionKey) => void;
  setDensityPreference: (preference: CognitiveDensity) => void;
  setReducedStimulusEnabled: (value: boolean) => void;
  reset: () => void;
};

type FocusModeStore = FocusModeState & FocusModeActions;

const initialState: FocusModeState = {
  isFocusModeEnabled: false,
  activeFocusTaskId: null,
  hiddenSections: [],
  densityPreference: "standard",
  reducedStimulusEnabled: false,
  lastEnabledAt: null,
};

export const useFocusModeStore = create<FocusModeStore>()(
  persist(
    (set) => ({
      ...initialState,

      enableFocusMode: (taskId) =>
        set({
          isFocusModeEnabled: true,
          activeFocusTaskId: taskId ?? null,
          lastEnabledAt: new Date().toISOString(),
        }),

      disableFocusMode: () =>
        set({
          isFocusModeEnabled: false,
          activeFocusTaskId: null,
          hiddenSections: [],
          lastEnabledAt: null,
        }),

      setActiveFocusTask: (taskId) => set({ activeFocusTaskId: taskId }),

      toggleSectionVisibility: (sectionKey) =>
        set((state) => ({
          hiddenSections: state.hiddenSections.includes(sectionKey)
            ? state.hiddenSections.filter((key) => key !== sectionKey)
            : [...state.hiddenSections, sectionKey],
        })),

      setDensityPreference: (preference) =>
        set({ densityPreference: preference }),

      setReducedStimulusEnabled: (value) =>
        set({ reducedStimulusEnabled: value }),

      reset: () => set(initialState),
    }),
    {
      name: "focus-mode-storage",
      storage: createJSONStorage(() => createPersistStorage()),
    },
  ),
);
