/**
 * Focus Mode Store
 * 
 * Zustand store for managing focus mode state.
 * Centralizes focus mode preferences and current active mode.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from './createPersistStorage';
import type { FocusMode, FocusModeState } from '@/types/focusModes';

type FocusModeStateExtended = FocusModeState & {
  preferences: {
    autoExitEnabled: boolean;
    autoExitDuration: number | null;
  };
};

type FocusModeActions = {
  setFocusMode: (mode: FocusMode) => void;
  exitFocusMode: () => void;
  setActiveTask: (taskId: string | null) => void;
  setAutoExitEnabled: (enabled: boolean) => void;
  setAutoExitDuration: (duration: number | null) => void;
  resetState: () => void;
};

const defaultState: FocusModeStateExtended = {
  currentMode: 'none',
  isFocusModeActive: false,
  activeTaskId: null,
  startTime: null,
  duration: null,
  preferences: {
    autoExitEnabled: false,
    autoExitDuration: null,
  },
};

type FocusModeStore = FocusModeStateExtended & FocusModeActions;

export const useFocusModeStore = create<FocusModeStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setFocusMode: (mode) =>
        set((state) => ({
          currentMode: mode,
          isFocusModeActive: mode !== 'none',
          startTime: mode !== 'none' && state.currentMode === 'none' ? Date.now() : state.startTime,
        })),

      exitFocusMode: () =>
        set((state) => ({
          currentMode: 'none',
          isFocusModeActive: false,
          activeTaskId: null,
          startTime: null,
          duration: state.startTime ? Date.now() - state.startTime : null,
        })),

      setActiveTask: (taskId) =>
        set((state) => ({
          activeTaskId: taskId,
        })),

      setAutoExitEnabled: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, autoExitEnabled: enabled },
        })),

      setAutoExitDuration: (duration) =>
        set((state) => ({
          preferences: { ...state.preferences, autoExitDuration: duration },
        })),

      resetState: () => set(defaultState),
    }),
    {
      name: 'focus-mode-storage',
      storage: createJSONStorage(() => createPersistStorage('focus-mode')),
    }
  )
);
