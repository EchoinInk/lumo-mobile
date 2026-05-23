/**
 * Sync Diagnostics Snapshot
 *
 * Generates a serializable diagnostic snapshot of the sync system.
 * Used for debugging, support, and future debug export screen.
 *
 * Snapshot includes:
 * - Queue statistics
 * - Retry statistics
 * - Dead letters
 * - Processing health
 * - Connectivity state
 * - Lock state
 * - Lag metrics
 *
 * Output is a plain JSON-serializable object.
 */

import { useSyncStore } from "../../../store/useSyncStore";
import { getQueueItems } from "../../storage/syncQueue";
import { getNetworkState, getNetworkStatus } from "../network";
import {
    getProcessingLockId,
    isSyncQueueProcessing,
} from "../queue/syncProcessor";
import { checkInvariants } from "../types";
import {
    getAllEntityStats,
    getDeadLetterCount,
    getFailedCount,
    getOldestPendingTimestamp,
    getPendingCount,
    getSyncLag,
} from "./syncSelectors";

// ── Snapshot Types ─────────────────────────────────────────────────────────

export interface SyncSnapshot {
  /** Snapshot timestamp */
  timestamp: string;

  /** Queue statistics */
  queue: {
    total: number;
    pending: number;
    failed: number;
    deadLetter: number;
    byEntity: Record<
      string,
      { pending: number; failed: number; deadLetter: number; total: number }
    >;
    byStatus: Record<string, number>;
  };

  /** Retry statistics */
  retries: {
    totalRetries: number;
    avgRetriesPerItem: number;
    maxRetries: number;
  };

  /** Dead letter details */
  deadLetters: Array<{
    id: string;
    entity: string;
    operation: string;
    entityId: string;
    retryCount: number;
    error: string | null;
    timestamp: string;
  }>;

  /** Processing health */
  processing: {
    isProcessing: boolean;
    lockId: string | null;
    lastProcessedAt: string | null;
  };

  /** Connectivity state */
  connectivity: {
    state: string;
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string;
    lastChangedAt: string;
  };

  /** Sync store state */
  store: {
    isSyncing: boolean;
    lastSyncedAt: string | null;
    isOffline: boolean;
    syncError: string | null;
  };

  /** Lag metrics */
  lag: {
    syncLagMs: number;
    oldestPendingTimestamp: string | null;
    oldestPendingAgeMs: number;
  };

  /** Health indicators */
  health: {
    isHealthy: boolean;
    violations: string[];
  };
}

// ── Snapshot Generation ─────────────────────────────────────────────────────

/**
 * Generate a comprehensive sync system snapshot.
 *
 * @returns Serializable diagnostic snapshot
 */
export function createSyncSnapshot(): SyncSnapshot {
  const items = getQueueItems();
  const now = new Date().toISOString();

  // Queue statistics
  const queue = {
    total: items.length,
    pending: getPendingCount(),
    failed: getFailedCount(),
    deadLetter: getDeadLetterCount(),
    byEntity: getAllEntityStats(),
    byStatus: items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  // Retry statistics
  const totalRetries = items.reduce((sum, item) => sum + item.retryCount, 0);
  const avgRetriesPerItem = items.length > 0 ? totalRetries / items.length : 0;
  const maxRetries =
    items.length > 0 ? Math.max(...items.map((item) => item.retryCount)) : 0;

  // Dead letter details
  const deadLetters = items
    .filter((item) => item.status === "failed" && item.retryCount >= 5)
    .map((item) => ({
      id: item.id,
      entity: item.entity,
      operation: item.operation,
      entityId: item.entityId,
      retryCount: item.retryCount,
      error: item.error || null,
      timestamp: item.timestamp,
    }));

  // Processing health
  const processing = {
    isProcessing: isSyncQueueProcessing(),
    lockId: getProcessingLockId(),
    lastProcessedAt: useSyncStore.getState().lastSyncedAt,
  };

  // Connectivity state
  const networkStatus = getNetworkStatus();
  const connectivity = {
    state: getNetworkState(),
    isConnected: networkStatus?.isConnected ?? false,
    isInternetReachable: networkStatus?.isInternetReachable ?? null,
    type: networkStatus?.type ?? "unknown",
    lastChangedAt: networkStatus?.lastChangedAt ?? now,
  };

  // Sync store state
  const storeState = useSyncStore.getState();
  const store = {
    isSyncing: storeState.isSyncing,
    lastSyncedAt: storeState.lastSyncedAt,
    isOffline: storeState.isOffline,
    syncError: storeState.syncError,
  };

  // Lag metrics
  const syncLagMs = getSyncLag();
  const oldestPendingTimestamp = getOldestPendingTimestamp();
  const oldestPendingAgeMs = oldestPendingTimestamp
    ? Date.now() - new Date(oldestPendingTimestamp).getTime()
    : 0;

  // Health indicators
  const violations: string[] = [];

  // Check for invariant violations
  for (const item of items) {
    const invariantCheck = checkInvariants(item);
    if (!invariantCheck.valid) {
      violations.push(
        `Invariant violation for ${item.id}: ${invariantCheck.violations.join(", ")}`,
      );
    }
  }

  // Check for processing lock without items
  if (processing.isProcessing && queue.pending === 0) {
    violations.push("Processing lock held but no pending items");
  }

  // Check for high dead letter count
  if (queue.deadLetter > 10) {
    violations.push(`High dead letter count: ${queue.deadLetter}`);
  }

  // Check for high sync lag
  if (syncLagMs > 300000) {
    // 5 minutes
    violations.push(`High sync lag: ${syncLagMs}ms`);
  }

  const health = {
    isHealthy:
      violations.length === 0 && queue.deadLetter === 0 && !store.syncError,
    violations,
  };

  return {
    timestamp: now,
    queue,
    retries: {
      totalRetries,
      avgRetriesPerItem,
      maxRetries,
    },
    deadLetters,
    processing,
    connectivity,
    store,
    lag: {
      syncLagMs,
      oldestPendingTimestamp,
      oldestPendingAgeMs,
    },
    health,
  };
}

// ── Snapshot Export ─────────────────────────────────────────────────────────

/**
 * Export snapshot as JSON string.
 *
 * @param snapshot - Snapshot to export
 * @returns JSON string
 */
export function exportSnapshotAsJson(snapshot: SyncSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Export snapshot as base64-encoded string.
 *
 * @param snapshot - Snapshot to export
 * @returns Base64-encoded string
 */
export function exportSnapshotAsBase64(snapshot: SyncSnapshot): string {
  const json = exportSnapshotAsJson(snapshot);
  return Buffer.from(json).toString("base64");
}
