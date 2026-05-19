import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from './createPersistStorage';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  onboardingCompleted: boolean;
}

type SettingsState = {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
};

type SettingsActions = {
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setError: (error: string | null) => void;
};

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  notificationsEnabled: true,
  soundEnabled: true,
  hapticFeedbackEnabled: true,
  onboardingCompleted: false,
};

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () => set({ settings: defaultSettings }),

      setOnboardingCompleted: (completed) =>
        set((state) => ({
          settings: { ...state.settings, onboardingCompleted: completed },
        })),

      setError: (error) => set({ error }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => createPersistStorage('settings')),
    }
  )
);
