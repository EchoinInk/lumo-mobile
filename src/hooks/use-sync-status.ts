/**
 * Sync Status Hook
 *
 * Provides sync state information to UI components.
 * Lightweight — no heavy subscriptions.
 */

import { useCallback, useEffect, useState } from 'react';
import { getPendingCount, hasPendingOperations } from '@/services/sync';
import { isSyncProcessing } from '@/services/sync/syncProcessor';
import { isOnline, onConnectivityChange } from '@/utils/network';

export function useSyncStatus() {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(getPendingCount());

  useEffect(() => {
    const unsub = onConnectivityChange((isConnected) => {
      setOnline(isConnected);
      // Refresh pending count when connectivity changes
      setPendingCount(getPendingCount());
    });

    return unsub;
  }, []);

  const refresh = useCallback(() => {
    setPendingCount(getPendingCount());
  }, []);

  return {
    isOnline: online,
    pendingCount,
    hasPending: pendingCount > 0,
    isSyncing: isSyncProcessing(),
    refresh,
  };
}
