/**
 * Sync Debug Hooks
 *
 * React hooks for sync diagnostics and debugging.
 * Isolated from production UX - for internal debug screen only.
 */

import { useEffect, useState } from 'react';
import { createSyncSnapshot, exportSnapshotAsJson } from '@/services/sync/monitor/createSyncSnapshot';
import type { SyncSnapshot } from '@/services/sync/monitor/createSyncSnapshot';
import { queueRepair } from '@/services/sync/repair';

/**
 * Hook to monitor sync system state.
 * Returns current snapshot and refresh function.
 */
export function useSyncSnapshot() {
  const [snapshot, setSnapshot] = useState<SyncSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = () => {
    setIsLoading(true);
    try {
      const newSnapshot = createSyncSnapshot();
      setSnapshot(newSnapshot);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { snapshot, isLoading, refresh };
}

/**
 * Hook to track sync health.
 * Returns health status and violations.
 */
export function useSyncHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [violations, setViolations] = useState<string[]>([]);

  const { snapshot, refresh } = useSyncSnapshot();

  useEffect(() => {
    if (snapshot) {
      setIsHealthy(snapshot.health.isHealthy);
      setViolations(snapshot.health.violations);
    }
  }, [snapshot]);

  return { isHealthy, violations, refresh };
}

/**
 * Hook to track queue statistics.
 * Returns queue metrics.
 */
export function useQueueStats() {
  const { snapshot } = useSyncSnapshot();

  if (!snapshot) {
    return {
      total: 0,
      pending: 0,
      failed: 0,
      deadLetter: 0,
      byEntity: {},
      byStatus: {},
    };
  }

  return snapshot.queue;
}

/**
 * Hook to track processing state.
 * Returns processing lock information.
 */
export function useProcessingState() {
  const { snapshot } = useSyncSnapshot();

  if (!snapshot) {
    return {
      isProcessing: false,
      lockId: null,
      lastProcessedAt: null,
    };
  }

  return snapshot.processing;
}

/**
 * Hook to track connectivity state.
 * Returns network status.
 */
export function useConnectivityState() {
  const { snapshot } = useSyncSnapshot();

  if (!snapshot) {
    return {
      state: 'unknown',
      isConnected: false,
      isInternetReachable: null,
      type: 'unknown',
      lastChangedAt: null,
    };
  }

  return snapshot.connectivity;
}

/**
 * Hook to track dead letters.
 * Returns dead letter items.
 */
export function useDeadLetters() {
  const { snapshot } = useSyncSnapshot();

  if (!snapshot) {
    return [];
  }

  return snapshot.deadLetters;
}

/**
 * Hook to execute repair operations.
 * Returns repair functions and results.
 */
export function useRepairOperations() {
  const [isRepairing, setIsRepairing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const repairQueue = async () => {
    setIsRepairing(true);
    try {
      const result = queueRepair.repairQueue();
      setLastResult(result);
      return result;
    } finally {
      setIsRepairing(false);
    }
  };

  const repairDeadLetters = async () => {
    setIsRepairing(true);
    try {
      const result = queueRepair.repairDeadLetters();
      setLastResult(result);
      return result;
    } finally {
      setIsRepairing(false);
    }
  };

  const recoverOrphaned = async () => {
    setIsRepairing(true);
    try {
      const result = queueRepair.recoverOrphanedItems();
      setLastResult(result);
      return result;
    } finally {
      setIsRepairing(false);
    }
  };

  const validateIntegrity = () => {
    const result = queueRepair.validateQueueIntegrity();
    setLastResult(result);
    return result;
  };

  return {
    isRepairing,
    lastResult,
    repairQueue,
    repairDeadLetters,
    recoverOrphaned,
    validateIntegrity,
  };
}

/**
 * Hook to export snapshot as JSON.
 * Returns export function.
 */
export function useSnapshotExport() {
  const { snapshot } = useSyncSnapshot();

  const exportAsJson = () => {
    if (!snapshot) return null;
    return exportSnapshotAsJson(snapshot);
  };

  const exportAsBase64 = () => {
    if (!snapshot) return null;
    const json = exportSnapshotAsJson(snapshot);
    return Buffer.from(json).toString('base64');
  };

  return { exportAsJson, exportAsBase64 };
}
