/**
 * Sync Store Network Hook
 *
 * Wires network state into the sync store.
 * This is the ONLY place where network utilities connect to Zustand state.
 * UI components never directly access network utilities.
 *
 * Usage: Call this hook once at app startup (e.g., in root layout)
 * to enable automatic network state synchronization.
 *
 * @example
 * function RootLayout() {
 *   useSyncStoreNetwork();
 *   return <App />;
 * }
 */

import { useEffect } from 'react';
import { useSyncStore } from '@/store/useSyncStore';
import { isOnline, subscribeToNetwork } from '@/utils/network';

export function useSyncStoreNetwork(): void {
  const setOffline = useSyncStore((state) => state.setOffline);

  useEffect(() => {
    // Initialize with current network state
    setOffline(!isOnline());

    // Subscribe to network changes
    const unsubscribe = subscribeToNetwork((online) => {
      setOffline(!online);
    });

    return unsubscribe;
  }, [setOffline]);
}
