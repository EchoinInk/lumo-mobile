/**
 * Sync Store
 *
 * Zustand store for persistent sync state only.
 * No business logic, no API calls, no side effects.
 * Pure state container for sync UI and orchestration.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from './createPersistStorage';

interface SyncState {
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** ISO timestamp of last successful sync */
  lastSyncedAt: string | null;
  /** Number of pending operations in sync queue */
  pendingOperations: number;
  /** Whether device is currently offline */
  isOffline: boolean;
  /** Current sync error message, if any */
  syncError: string | null;
}

interface SyncActions {
  /** Set syncing state */
  setSyncing: (isSyncing: boolean) => void;
  /** Set last successful sync timestamp */
  setLastSyncedAt: (timestamp: string | null) => void;
  /** Set pending operations count */
  setPendingOperations: (count: number) => void;
  /** Set offline state */
  setOffline: (isOffline: boolean) => void;
  /** Set sync error message */
  setSyncError: (error: string | null) => void;
  /** Clear sync error */
  clearSyncError: () => void;
  /** Reset all sync state to defaults */
  resetSyncState: () => void;
}

type SyncStore = SyncState & SyncActions;

const initialState: SyncState = {
  isSyncing: false,
  lastSyncedAt: null,
  pendingOperations: 0,
  isOffline: false,
  syncError: null,
};

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSyncing: (isSyncing) => set({ isSyncing }),

      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),

      setPendingOperations: (pendingOperations) => set({ pendingOperations }),

      setOffline: (isOffline) => set({ isOffline }),

      setSyncError: (syncError) => set({ syncError }),

      clearSyncError: () => set({ syncError: null }),

      resetSyncState: () => set(initialState),
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => createPersistStorage('sync')),
    }
  )
);

// Selectors for derived state
export const selectIsSyncHealthy = (state: SyncState) =>
  !state.isOffline && !state.syncError && state.pendingOperations === 0;

export const selectNeedsAttention = (state: SyncState) =>
  state.syncError !== null || (state.isOffline && state.pendingOperations > 0);
