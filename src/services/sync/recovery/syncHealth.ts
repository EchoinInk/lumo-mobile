/**
 * Sync Health
 *
 * Monitors sync health and provides diagnostics.
 * Tracks sync failures, queue health, and recovery metrics.
 */

import { storageInstance as mmkvStorage } from "../../../store/storage";
import { observability } from "../../observability";
import type { SyncQueueItem } from "../../storage/queue.types";
import { SYNC_QUEUE_STORAGE_KEY } from "../../storage/queue.types";

const SYNC_QUEUE_KEY = SYNC_QUEUE_STORAGE_KEY;

/**
 * Sync health metrics.
 */
export interface SyncHealthMetrics {
  /** Total queue items */
  totalItems: number;
  /** Pending items */
  pendingItems: number;
  /** Processing items */
  processingItems: number;
  /** Failed items */
  failedItems: number;
  /** Synced items */
  syncedItems: number;
  /** Dead letter items */
  deadLetterItems: number;
  /** Average retry count */
  averageRetryCount: number;
  /** Oldest pending item age in milliseconds */
  oldestPendingAge: number;
  /** Queue health score (0-100) */
  healthScore: number;
}

/**
 * Get sync health metrics.
 *
 * @returns Sync health metrics
 */
export function getSyncHealthMetrics(): SyncHealthMetrics {
  if (!mmkvStorage) {
    return {
      totalItems: 0,
      pendingItems: 0,
      processingItems: 0,
      failedItems: 0,
      syncedItems: 0,
      deadLetterItems: 0,
      averageRetryCount: 0,
      oldestPendingAge: 0,
      healthScore: 100,
    };
  }

  const queueData = mmkvStorage.getString(SYNC_QUEUE_KEY);
  if (!queueData) {
    return {
      totalItems: 0,
      pendingItems: 0,
      processingItems: 0,
      failedItems: 0,
      syncedItems: 0,
      deadLetterItems: 0,
      averageRetryCount: 0,
      oldestPendingAge: 0,
      healthScore: 100,
    };
  }

  try {
    const queue: SyncQueueItem[] = JSON.parse(queueData);

    const pendingItems = queue.filter((item) => item.status === "pending");
    const processingItems = queue.filter((item) => item.status === "processing");
    const failedItems = queue.filter((item) => item.status === "failed");
    const syncedItems = queue.filter((item) => item.status === "synced");
    const deadLetterItems = queue.filter((item) => item.status === "dead_letter");

    const totalRetryCount = queue.reduce((sum, item) => sum + item.retryCount, 0);
    const averageRetryCount = queue.length > 0 ? totalRetryCount / queue.length : 0;

    const now = Date.now();
    const oldestPendingAge =
      pendingItems.length > 0
        ? Math.max(...pendingItems.map((item) => now - new Date(item.timestamp).getTime()))
        : 0;

    // Calculate health score
    // Higher score = healthier queue
    let healthScore = 100;
    healthScore -= failedItems.length * 5; // Penalize failed items
    healthScore -= deadLetterItems.length * 10; // Penalize dead letter items
    healthScore -= Math.min(oldestPendingAge / (24 * 60 * 60 * 1000), 10); // Penalize old pending items (max 10 points)
    healthScore = Math.max(0, healthScore);

    const healthMetrics = {
      totalItems: queue.length,
      pendingItems: pendingItems.length,
      processingItems: processingItems.length,
      failedItems: failedItems.length,
      syncedItems: syncedItems.length,
      deadLetterItems: deadLetterItems.length,
      averageRetryCount,
      oldestPendingAge,
      healthScore,
    };
    observability.performance.recordMetric("sync.health_score", healthScore, {
      queueSize: queue.length,
      failedItems: failedItems.length,
      deadLetterItems: deadLetterItems.length,
    });
    return healthMetrics;
  } catch (err) {
    observability.logger.error("[getSyncHealthMetrics] Failed to parse queue", err);
    observability.sync.recordSyncFailure("getSyncHealthMetrics", err, {
      reason: "queue_parse_failed",
    });
    return {
      totalItems: 0,
      pendingItems: 0,
      processingItems: 0,
      failedItems: 0,
      syncedItems: 0,
      deadLetterItems: 0,
      averageRetryCount: 0,
      oldestPendingAge: 0,
      healthScore: 0,
    };
  }
}

/**
 * Check if sync is healthy.
 *
 * @returns Whether sync is healthy
 */
export function isSyncHealthy(): boolean {
  const metrics = getSyncHealthMetrics();
  return metrics.healthScore >= 70;
}

/**
 * Get sync health status message.
 *
 * @returns Human-readable health status
 */
export function getSyncHealthStatus(): string {
  const metrics = getSyncHealthMetrics();

  if (metrics.healthScore >= 90) {
    return "Sync is healthy 💜";
  } else if (metrics.healthScore >= 70) {
    return "Sync is working well";
  } else if (metrics.healthScore >= 50) {
    return "Sync needs attention";
  } else {
    return "Sync needs recovery";
  }
}
