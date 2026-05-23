/**
 * Sync Status Hook
 *
 * Provides sync state information to UI components.
 * Lightweight — no heavy subscriptions.
 */

import {
    getPendingCount,
    hasPendingOperations,
} from "@/services/storage/syncQueue";
import { isOnline, subscribeToNetworkChanges } from "@/services/sync/network";
import { isSyncQueueProcessing } from "@/services/sync/queue/syncProcessor";
import { useCallback, useEffect, useState } from "react";

export function useSyncStatus() {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(getPendingCount());

  useEffect(() => {
    const unsub = subscribeToNetworkChanges((state) => {
      setOnline(state === "online");
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
    hasPending: hasPendingOperations(),
    isSyncing: isSyncQueueProcessing(),
    refresh,
  };
}
