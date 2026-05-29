/**
 * Calm Mode Store
 *
 * Zustand domain store for Calm Mode state management.
 * Uses MMKV persistence following project patterns.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createPersistStorage } from "@/src/store/createPersistStorage";
import type {
  CalmModeState,
  EnvironmentalIntensity,
} from "../types/calmMode.types";

type CalmModeActions = {
  enableCalmMode: () => void;
  disableCalmMode: () => void;
  setReducedMotionEnabled: (value: boolean) => void;
  setSoftenedGradientsEnabled: (value: boolean) => void;
  setReducedDecorativeElements: (value: boolean) => void;
  setReducedContrastMode: (value: boolean) => void;
  setEnvironmentalIntensity: (intensity: EnvironmentalIntensity) => void;
  reset: () => void;
};

type CalmModeStore = CalmModeState & CalmModeActions;

const initialState: CalmModeState = {
  isCalmModeEnabled: false,
  reducedMotionEnabled: false,
  softenedGradientsEnabled: false,
  reducedDecorativeElements: false,
  reducedContrastMode: false,
  environmentalIntensity: "balanced",
  lastEnabledAt: null,
};

export const useCalmModeStore = create<CalmModeStore>()(
  persist(
    (set) => ({
      ...initialState,

      enableCalmMode: () =>
        set({
          isCalmModeEnabled: true,
          lastEnabledAt: new Date().toISOString(),
        }),

      disableCalmMode: () =>
        set({
          isCalmModeEnabled: false,
          lastEnabledAt: null,
        }),

      setReducedMotionEnabled: (value) =>
        set({ reducedMotionEnabled: value }),

      setSoftenedGradientsEnabled: (value) =>
        set({ softenedGradientsEnabled: value }),

      setReducedDecorativeElements: (value) =>
        set({ reducedDecorativeElements: value }),

      setReducedContrastMode: (value) =>
        set({ reducedContrastMode: value }),

      setEnvironmentalIntensity: (intensity) =>
        set({ environmentalIntensity: intensity }),

      reset: () => set(initialState),
    }),
    {
      name: "calm-mode-storage",
      storage: createJSONStorage(() => createPersistStorage()),
    },
  ),
);
