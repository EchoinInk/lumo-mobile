/**
 * Sync Debug Utilities
 *
 * Development-only utilities for debugging sync behavior.
 * All functions are guarded behind __DEV__ checks.
 *
 * WARNING: Do not use these in production code.
 */

import { setString } from "../../storage/mmkv";
import { clearQueue, getQueueItems } from "../../storage/syncQueue";
import { DEAD_LETTER_STORAGE_KEY, DEDUP_STORAGE_KEY } from "../config";
import { logSyncError, logSyncEvent } from "../monitor/syncLogger";

// ── Guard ───────────────────────────────────────────────────────────────────

/**
 * Check if debug mode is enabled.
 */
function isDebugEnabled(): boolean {
  return __DEV__ === true;
}

// ── Queue Debug Utilities ───────────────────────────────────────────────────

/**
 * Reset the entire sync queue.
 * Removes all pending, failed, and completed items.
 *
 * @dev-only
 */
export function resetQueue(): void {
  if (!isDebugEnabled()) {
    console.warn("[SyncDebug] resetQueue is dev-only");
    return;
  }

  try {
    clearQueue();
    logSyncEvent("Debug", undefined, undefined, "RESET", "Queue cleared");
    console.log("[SyncDebug] Queue has been reset");
  } catch (error) {
    logSyncError("Debug", undefined, undefined, error);
  }
}

/**
 * Clear all dead-letter items.
 * Removes items that have exceeded max retry count.
 *
 * @dev-only
 */
export function clearDeadLetters(): void {
  if (!isDebugEnabled()) {
    console.warn("[SyncDebug] clearDeadLetters is dev-only");
    return;
  }

  try {
    const items = getQueueItems();
    let cleared = 0;

    for (const item of items) {
      // Remove failed items with high retry count
      if (item.status === "failed" && item.retryCount >= 5) {
        clearQueue();
        cleared++;
      }
    }

    logSyncEvent(
      "Debug",
      undefined,
      undefined,
      "CLEAR_DEAD_LETTERS",
      `Cleared ${cleared} dead-letter items`,
    );
    console.log(`[SyncDebug] Cleared ${cleared} dead-letter items`);
  } catch (error) {
    logSyncError("Debug", undefined, undefined, error);
  }
}

/**
 * Inspect the current queue state.
 * Returns a summary of queue contents.
 *
 * @dev-only
 */
export function inspectQueue(): {
  total: number;
  pending: number;
  failed: number;
  deadLetter: number;
  items: unknown[];
} {
  if (!isDebugEnabled()) {
    console.warn("[SyncDebug] inspectQueue is dev-only");
    return {
      total: 0,
      pending: 0,
      failed: 0,
      deadLetter: 0,
      items: [],
    };
  }

  try {
    const items = getQueueItems();
    const pending = items.filter((item) => item.status === "pending").length;
    const failed = items.filter((item) => item.status === "failed").length;
    const deadLetter = items.filter(
      (item) => item.status === "failed" && item.retryCount >= 5,
    ).length;

    const summary = {
      total: items.length,
      pending,
      failed,
      deadLetter,
      items: items.map((item) => ({
        id: item.id,
        entity: item.entity,
        operation: item.operation,
        entityId: item.entityId,
        status: item.status,
        retryCount: item.retryCount,
        timestamp: item.timestamp,
      })),
    };

    console.log("[SyncDebug] Queue inspection:", summary);
    return summary;
  } catch (error) {
    logSyncError("Debug", undefined, undefined, error);
    return {
      total: 0,
      pending: 0,
      failed: 0,
      deadLetter: 0,
      items: [],
    };
  }
}

// ── Failure Simulation ───────────────────────────────────────────────────────

/**
 * Simulate a sync failure for testing.
 * Adds a malformed item to the queue.
 *
 * @dev-only
 */
export function simulateFailure(): void {
  if (!isDebugEnabled()) {
    console.warn("[SyncDebug] simulateFailure is dev-only");
    return;
  }

  try {
    const items = getQueueItems();
    const malformedItem = {
      id: `debug_fail_${Date.now()}`,
      entity: "task" as const,
      operation: "create" as const,
      entityId: "debug_entity",
      timestamp: new Date().toISOString(),
      payload: { _debug: true },
      retryCount: 0,
      status: "pending" as const,
      error: null,
    } as any;

    items.push(malformedItem);
    setString("sync_queue_v1", JSON.stringify(items));

    logSyncEvent(
      "Debug",
      undefined,
      undefined,
      "SIMULATE_FAILURE",
      "Added malformed item to queue",
    );
    console.log(
      "[SyncDebug] Simulated failure - added malformed item to queue",
    );
  } catch (error) {
    logSyncError("Debug", undefined, undefined, error);
  }
}

/**
 * Clear deduplication cache.
 * Forces re-processing of duplicate events.
 *
 * @dev-only
 */
export function clearDedupCache(): void {
  if (!isDebugEnabled()) {
    console.warn("[SyncDebug] clearDedupCache is dev-only");
    return;
  }

  try {
    setString(DEDUP_STORAGE_KEY, JSON.stringify({}));
    logSyncEvent(
      "Debug",
      undefined,
      undefined,
      "CLEAR_DEDUP",
      "Dedup cache cleared",
    );
    console.log("[SyncDebug] Dedup cache has been cleared");
  } catch (error) {
    logSyncError("Debug", undefined, undefined, error);
  }
}

/**
 * Clear dead letter storage.
 *
 * @dev-only
 */
export function clearDeadLetterStorage(): void {
  if (!isDebugEnabled()) {
    console.warn("[SyncDebug] clearDeadLetterStorage is dev-only");
    return;
  }

  try {
    setString(DEAD_LETTER_STORAGE_KEY, JSON.stringify({}));
    logSyncEvent(
      "Debug",
      undefined,
      undefined,
      "CLEAR_DEAD_LETTER_STORAGE",
      "Dead letter storage cleared",
    );
    console.log("[SyncDebug] Dead letter storage has been cleared");
  } catch (error) {
    logSyncError("Debug", undefined, undefined, error);
  }
}

// ── Export All Debug Functions ───────────────────────────────────────────────

export const syncDebug = {
  resetQueue,
  clearDeadLetters,
  inspectQueue,
  simulateFailure,
  clearDedupCache,
  clearDeadLetterStorage,
};
