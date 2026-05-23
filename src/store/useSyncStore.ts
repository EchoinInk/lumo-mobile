/**
 * Sync Store
 *
 * Zustand store for sync UI state only.
 * No queue data - queue remains MMKV-owned.
 * No business logic, no API calls, no side effects.
 *
 * Responsibility:
 * - Track sync processing state
 * - Track last sync timestamp
 * - Track connectivity-derived status
 * - Track health state
 *
 * Queue metrics should be read from MMKV via selectors in syncSelectors.ts
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createPersistStorage } from "./createPersistStorage";

interface SyncState {
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** ISO timestamp of last successful sync */
  lastSyncedAt: string | null;
  /** Whether device is currently offline (derived from network monitor) */
  isOffline: boolean;
  /** Current sync error message, if any */
  syncError: string | null;
}

interface SyncActions {
  /** Set syncing state */
  setSyncing: (isSyncing: boolean) => void;
  /** Set last successful sync timestamp */
  setLastSyncedAt: (timestamp: string | null) => void;
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
  isOffline: false,
  syncError: null,
};

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSyncing: (isSyncing) => set({ isSyncing }),

      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),

      setOffline: (isOffline) => set({ isOffline }),

      setSyncError: (syncError) => set({ syncError }),

      clearSyncError: () => set({ syncError: null }),

      resetSyncState: () => set(initialState),
    }),
    {
      name: "sync-storage",
      storage: createJSONStorage(() => createPersistStorage()),
    },
  ),
);

// Selectors for derived state
export const selectIsSyncHealthy = (state: SyncState) =>
  !state.isOffline && !state.syncError;

export const selectNeedsAttention = (state: SyncState) =>
  state.syncError !== null || state.isOffline;
