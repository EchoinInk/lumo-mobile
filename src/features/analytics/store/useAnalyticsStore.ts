/**
 * Analytics Store
 * 
 * Analytics state management.
 * Tracks analytics preferences and opt-out status.
 */

import { createPersistStorage } from '@/store/createPersistStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AnalyticsState {
  enabled: boolean;
  hasOptedOut: boolean;
  optOutTimestamp: number | null;
}

interface AnalyticsActions {
  setEnabled: (enabled: boolean) => void;
  optOut: () => void;
  optIn: () => void;
  reset: () => void;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

const initialState: AnalyticsState = {
  enabled: true,
  hasOptedOut: false,
  optOutTimestamp: null,
};

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      ...initialState,
      setEnabled: (enabled) => set({ enabled }),
      optOut: () => set({ 
        enabled: false, 
        hasOptedOut: true, 
        optOutTimestamp: Date.now() 
      }),
      optIn: () => set({ 
        enabled: true, 
        hasOptedOut: false, 
        optOutTimestamp: null 
      }),
      reset: () => set(initialState),
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => createPersistStorage('analytics')),
    }
  )
);
