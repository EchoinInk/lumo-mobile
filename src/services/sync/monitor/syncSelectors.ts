/**
 * Sync Queue Metrics Selectors
 *
 * Pure, memo-friendly selectors for queue metrics.
 * Used for UI display and debugging.
 *
 * Responsibility:
 * - Provide derived queue statistics
 * - Side-effect free
 * - Memo-friendly
 * - Prepare for future Settings/Debug screen
 */

import {
  getQueueItems,
  getPendingItems,
  getFailedItems,
} from '../../storage/syncQueue';
import type { SyncQueueItem } from '../../storage/queue.types';
import { MAX_RETRY_COUNT } from '../../storage/queue.types';

// ── Count Selectors ───────────────────────────────────────────────────────────

/**
 * Get the count of pending queue items.
 * Pure function - no side effects.
 */
export function getPendingCount(): number {
  return getPendingItems().length;
}

/**
 * Get the count of failed queue items.
 * Pure function - no side effects.
 */
export function getFailedCount(): number {
  return getFailedItems().length;
}

/**
 * Get the count of dead-letter items (failed with max retries exceeded).
 * Pure function - no side effects.
 */
export function getDeadLetterCount(): number {
  return getQueueItems().filter(
    (item) => item.status === 'failed' && item.retryCount >= MAX_RETRY_COUNT
  ).length;
}

/**
 * Get the total count of all queue items.
 * Pure function - no side effects.
 */
export function getTotalQueueCount(): number {
  return getQueueItems().length;
}

// ── Item Selectors ───────────────────────────────────────────────────────────

/**
 * Get all dead-letter items.
 * Returns copy of items - safe to modify.
 */
export function getDeadLetterItems(): SyncQueueItem[] {
  return getQueueItems().filter(
    (item) => item.status === 'failed' && item.retryCount >= MAX_RETRY_COUNT
  );
}

/**
 * Get queue items grouped by entity type.
 */
export function getItemsByEntity(): Record<string, SyncQueueItem[]> {
  const items = getQueueItems();
  const grouped: Record<string, SyncQueueItem[]> = {};

  for (const item of items) {
    if (!grouped[item.entity]) {
      grouped[item.entity] = [];
    }
    grouped[item.entity].push(item);
  }

  return grouped;
}

/**
 * Get queue items grouped by status.
 */
export function getItemsByStatus(): Record<string, SyncQueueItem[]> {
  const items = getQueueItems();
  const grouped: Record<string, SyncQueueItem[]> = {
    pending: [],
    failed: [],
    completed: [],
  };

  for (const item of items) {
    if (grouped[item.status]) {
      grouped[item.status].push(item);
    }
  }

  return grouped;
}

// ── Timing Selectors ─────────────────────────────────────────────────────────

/**
 * Calculate sync lag - time since oldest pending item was created.
 * Returns 0 if no pending items.
 */
export function getSyncLag(): number {
  const pending = getPendingItems();
  if (pending.length === 0) return 0;

  const oldestTimestamp = pending
    .map((item) => new Date(item.timestamp).getTime())
    .reduce((min, time) => Math.min(min, time), Infinity);

  return Date.now() - oldestTimestamp;
}

/**
 * Get the timestamp of the oldest pending item.
 * Returns null if no pending items.
 */
export function getOldestPendingTimestamp(): string | null {
  const pending = getPendingItems();
  if (pending.length === 0) return null;

  const oldest = pending.reduce((oldest, item) =>
    item.timestamp < oldest.timestamp ? item : oldest
  );

  return oldest.timestamp;
}

// ── Entity Statistics ───────────────────────────────────────────────────────

/**
 * Get sync statistics for a specific entity type.
 */
export function getEntitySyncStats(entity: string): {
  pending: number;
  failed: number;
  deadLetter: number;
  total: number;
} {
  const items = getQueueItems().filter((item) => item.entity === entity);

  return {
    pending: items.filter((item) => item.status === 'pending').length,
    failed: items.filter((item) => item.status === 'failed').length,
    deadLetter: items.filter(
      (item) => item.status === 'failed' && item.retryCount >= MAX_RETRY_COUNT
    ).length,
    total: items.length,
  };
}

/**
 * Get sync statistics for all entity types.
 */
export function getAllEntityStats(): Record<string, {
  pending: number;
  failed: number;
  deadLetter: number;
  total: number;
}> {
  const items = getQueueItems();
  const stats: Record<string, {
    pending: number;
    failed: number;
    deadLetter: number;
    total: number;
  }> = {};

  for (const item of items) {
    if (!stats[item.entity]) {
      stats[item.entity] = { pending: 0, failed: 0, deadLetter: 0, total: 0 };
    }
    stats[item.entity].total++;

    if (item.status === 'pending') {
      stats[item.entity].pending++;
    } else if (item.status === 'failed') {
      stats[item.entity].failed++;
      if (item.retryCount >= MAX_RETRY_COUNT) {
        stats[item.entity].deadLetter++;
      }
    }
  }

  return stats;
}

// ── Health Selectors ─────────────────────────────────────────────────────────

/**
 * Check if queue is healthy.
 * Queue is healthy if:
 * - No dead-letter items
 * - Failed items < 50% of total
 */
export function isQueueHealthy(): boolean {
  const items = getQueueItems();
  if (items.length === 0) return true;

  const deadLetterCount = getDeadLetterCount();
  if (deadLetterCount > 0) return false;

  const failedCount = getFailedCount();
  const failureRatio = failedCount / items.length;

  return failureRatio < 0.5;
}
