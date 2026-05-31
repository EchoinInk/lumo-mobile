/**
 * Queue Diagnostics
 *
 * Provides detailed diagnostics for sync queue issues.
 * Helps identify patterns in failures, bottlenecks, and recovery needs.
 */

import { storageInstance as mmkvStorage } from "../../../store/storage";
import { observability } from "../../observability";
import type { SyncQueueItem } from "../../storage/queue.types";
import { SYNC_QUEUE_STORAGE_KEY } from "../../storage/queue.types";

const SYNC_QUEUE_KEY = SYNC_QUEUE_STORAGE_KEY;

/**
 * Queue diagnostic report.
 */
export interface QueueDiagnosticReport {
  /** Total queue items */
  totalItems: number;
  /** Items by status */
  itemsByStatus: Record<string, number>;
  /** Items by entity type */
  itemsByEntity: Record<string, number>;
  /** Items by operation type */
  itemsByOperation: Record<string, number>;
  /** Items by owner type */
  itemsByOwnerType: Record<string, number>;
  /** Common error messages */
  commonErrors: Array<{ message: string; count: number }>;
  /** Items with high retry count */
  highRetryItems: Array<{ id: string; retryCount: number; entity: string }>;
  /** Stuck items (processing for too long) */
  stuckItems: Array<{ id: string; entity: string; stuckDuration: number }>;
  /** Recommendations */
  recommendations: string[];
}

/**
 * Generate queue diagnostic report.
 *
 * @returns Queue diagnostic report
 */
export function generateQueueDiagnostics(): QueueDiagnosticReport {
  if (!mmkvStorage) {
    return {
      totalItems: 0,
      itemsByStatus: {},
      itemsByEntity: {},
      itemsByOperation: {},
      itemsByOwnerType: {},
      commonErrors: [],
      highRetryItems: [],
      stuckItems: [],
      recommendations: ["MMKV storage not available"],
    };
  }

  const queueData = mmkvStorage.getString(SYNC_QUEUE_KEY);
  if (!queueData) {
    return {
      totalItems: 0,
      itemsByStatus: {},
      itemsByEntity: {},
      itemsByOperation: {},
      itemsByOwnerType: {},
      commonErrors: [],
      highRetryItems: [],
      stuckItems: [],
      recommendations: ["Queue is empty"],
    };
  }

  try {
    const queue: SyncQueueItem[] = JSON.parse(queueData);

    const itemsByStatus: Record<string, number> = {};
    const itemsByEntity: Record<string, number> = {};
    const itemsByOperation: Record<string, number> = {};
    const itemsByOwnerType: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};
    const highRetryItems: Array<{ id: string; retryCount: number; entity: string }> = [];
    const stuckItems: Array<{ id: string; entity: string; stuckDuration: number }> = [];

    const now = Date.now();
    const STUCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

    for (const item of queue) {
      // Count by status
      itemsByStatus[item.status] = (itemsByStatus[item.status] || 0) + 1;

      // Count by entity
      itemsByEntity[item.entity] = (itemsByEntity[item.entity] || 0) + 1;

      // Count by operation
      itemsByOperation[item.operation] = (itemsByOperation[item.operation] || 0) + 1;

      // Count by owner type
      itemsByOwnerType[item.ownerType] = (itemsByOwnerType[item.ownerType] || 0) + 1;

      // Count errors
      if (item.error) {
        errorCounts[item.error] = (errorCounts[item.error] || 0) + 1;
      }

      // High retry items
      if (item.retryCount >= 3) {
        highRetryItems.push({
          id: item.id,
          retryCount: item.retryCount,
          entity: item.entity,
        });
      }

      // Stuck items
      if (item.status === "processing" && item.lastAttemptAt) {
        const stuckDuration = now - item.lastAttemptAt;
        if (stuckDuration > STUCK_THRESHOLD_MS) {
          stuckItems.push({
            id: item.id,
            entity: item.entity,
            stuckDuration,
          });
        }
      }
    }

    // Common errors
    const commonErrors = Object.entries(errorCounts)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recommendations
    const recommendations: string[] = [];

    if (itemsByStatus.failed > 10) {
      recommendations.push("High number of failed items - consider running queue recovery");
    }

    if (itemsByStatus.dead_letter > 0) {
      recommendations.push("Dead letter items detected - manual intervention may be required");
    }

    if (highRetryItems.length > 5) {
      recommendations.push("Multiple items with high retry count - check for recurring sync issues");
    }

    if (stuckItems.length > 0) {
      recommendations.push("Stuck processing items detected - queue may need reset");
    }

    if (itemsByOwnerType.guest > 0 && itemsByOwnerType.authenticated > 0) {
      recommendations.push("Mixed owner types in queue - check migration status");
    }

    if (recommendations.length === 0) {
      recommendations.push("Queue appears healthy");
    }

    const report = {
      totalItems: queue.length,
      itemsByStatus,
      itemsByEntity,
      itemsByOperation,
      itemsByOwnerType,
      commonErrors,
      highRetryItems,
      stuckItems,
      recommendations,
    };
    observability.performance.recordMetric("sync.queue_diagnostic_items", queue.length, {
      failedItems: itemsByStatus.failed ?? 0,
      deadLetterItems: itemsByStatus.dead_letter ?? 0,
      stuckItems: stuckItems.length,
      highRetryItems: highRetryItems.length,
    });
    return report;
  } catch (err) {
    observability.logger.error(
      "[generateQueueDiagnostics] Failed to parse queue",
      err,
    );
    observability.sync.recordSyncFailure("generateQueueDiagnostics", err, {
      reason: "queue_parse_failed",
    });
    return {
      totalItems: 0,
      itemsByStatus: {},
      itemsByEntity: {},
      itemsByOperation: {},
      itemsByOwnerType: {},
      commonErrors: [],
      highRetryItems: [],
      stuckItems: [],
      recommendations: ["Failed to parse queue"],
    };
  }
}

/**
 * Print queue diagnostics to console.
 *
 * @returns Diagnostic report
 */
export function printQueueDiagnostics(): QueueDiagnosticReport {
  const report = generateQueueDiagnostics();

  observability.logger.info("[QueueDiagnostics] Queue diagnostic report", {
    totalItems: report.totalItems,
    itemsByStatus: report.itemsByStatus,
    itemsByEntity: report.itemsByEntity,
    itemsByOperation: report.itemsByOperation,
    itemsByOwnerType: report.itemsByOwnerType,
    commonErrorCount: report.commonErrors.length,
    highRetryCount: report.highRetryItems.length,
    stuckItemCount: report.stuckItems.length,
    recommendationCount: report.recommendations.length,
  });

  return report;
}
