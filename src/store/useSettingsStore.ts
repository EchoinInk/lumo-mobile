import { create } from 'zustand';

interface SettingsState {
  settings: null;
  // Add settings-related state and actions here
}

export const useSettingsStore = create<SettingsState>(() => ({
  settings: null,
}));
