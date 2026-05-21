/**
 * Accessibility Store
 *
 * Zustand store for managing accessibility preferences.
 * Centralizes motion, haptic, and visual accessibility settings.
 */

import type { AccessibilityPreferences } from "@/types/accessibility";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createPersistStorage } from "./createPersistStorage";

type AccessibilityState = {
  preferences: AccessibilityPreferences;
  isLoading: boolean;
  error: string | null;
};

type AccessibilityActions = {
  setReducedMotion: (enabled: boolean) => void;
  setMotionIntensity: (intensity: "none" | "reduced" | "normal") => void;
  setHapticFeedbackEnabled: (enabled: boolean) => void;
  setHapticIntensity: (intensity: "light" | "normal" | "strong") => void;
  setHighContrast: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void;
  resetPreferences: () => void;
  setError: (error: string | null) => void;
};

const defaultPreferences: AccessibilityPreferences = {
  reducedMotion: false,
  motionIntensity: "normal",
  hapticFeedbackEnabled: true,
  hapticIntensity: "normal",
  highContrast: false,
  largeText: false,
  preserveFocusAnimations: true,
  preserveOrientationAnimations: true,
  preserveStateAnimations: true,
  preserveDelightAnimations: true,
  simplifiedMode: false,
  adaptiveComplexity: true,
};

type AccessibilityStore = AccessibilityState & AccessibilityActions;

export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      isLoading: false,
      error: null,

      setReducedMotion: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, reducedMotion: enabled },
        })),

      setMotionIntensity: (intensity) =>
        set((state) => ({
          preferences: { ...state.preferences, motionIntensity: intensity },
        })),

      setHapticFeedbackEnabled: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, hapticFeedbackEnabled: enabled },
        })),

      setHapticIntensity: (intensity) =>
        set((state) => ({
          preferences: { ...state.preferences, hapticIntensity: intensity },
        })),

      setHighContrast: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, highContrast: enabled },
        })),

      setLargeText: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, largeText: enabled },
        })),

      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      resetPreferences: () => set({ preferences: defaultPreferences }),

      setError: (error) => set({ error }),
    }),
    {
      name: "accessibility-storage",
      storage: createJSONStorage(() => createPersistStorage("accessibility")),
    },
  ),
);
