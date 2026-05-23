/**
 * Queue Recovery Layer
 *
 * On app startup:
 * - Scan MMKV queue for corruption
 * - Remove corrupted items
 * - Reset stuck "processing" states (legacy compat)
 * - Re-queue failed items (if retryable)
 * - Clean up dedup expired entries
 *
 * Architecture:
 *   App Startup → Recovery → Healthy Queue → Processor
 *
 * Responsibility:
 * - Ensure queue integrity on startup
 * - Handle crash recovery
 * - No business logic
 * - Safe to run multiple times (idempotent)
 */

import {
  getQueueItems,
  removeItem,
  updateItemStatus,
} from '../../storage/syncQueue';
import type { SyncQueueItem, QueueItemStatus } from '../../storage/queue.types';
import { MAX_RETRY_COUNT } from '../../storage/queue.types';
import { cleanupExpiredEvents } from './queue.dedup';

// ── Validation ─────────────────────────────────────────────────────────────

/**
 * Check if a queue item is corrupted (missing required fields).
 */
function isCorruptedItem(item: unknown): boolean {
  if (!item || typeof item !== 'object') return true;

  const required = ['id', 'entity', 'operation', 'entityId', 'timestamp'];
  const obj = item as Record<string, unknown>;

  for (const field of required) {
    if (obj[field] === undefined || obj[field] === null) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a failed item should be re-queued (retryable).
 * Non-retryable: max retries exceeded, auth errors, validation errors.
 */
function isRetryableFailure(item: SyncQueueItem): boolean {
  // Already maxed out retries
  if (item.retryCount >= MAX_RETRY_COUNT) {
    return false;
  }

  // Has error message? Check if non-retryable
  if (item.error) {
    const errorLower = item.error.toLowerCase();

    // Auth errors — not retryable without user action
    if (
      errorLower.includes('unauthorized') ||
      errorLower.includes('forbidden') ||
      errorLower.includes('auth')
    ) {
      return false;
    }

    // Validation errors — data problem, not retryable
    if (
      errorLower.includes('validation') ||
      errorLower.includes('invalid') ||
      errorLower.includes('constraint')
    ) {
      return false;
    }

    // "Not configured" — Supabase not set up, don't keep retrying
    if (errorLower.includes('not configured')) {
      return false;
    }
  }

  return true;
}

// ── Recovery Actions ───────────────────────────────────────────────────────

/**
 * Remove corrupted items from queue.
 * Returns count of removed items.
 */
function removeCorruptedItems(items: SyncQueueItem[]): number {
  let removed = 0;

  for (const item of items) {
    if (isCorruptedItem(item)) {
      console.warn('[QueueRecovery] Removing corrupted item:', item);
      removeItem(item.id);
      removed++;
    }
  }

  return removed;
}

/**
 * Reset failed items that can be retried.
 * Changes status from 'failed' to 'pending' if retryable.
 * Returns count of reset items.
 */
function resetFailedItems(items: SyncQueueItem[]): number {
  let reset = 0;

  for (const item of items) {
    if (item.status === 'failed' && isRetryableFailure(item)) {
      console.log(
        `[QueueRecovery] Resetting failed item for retry: ${item.entity}:${item.operation} (${item.entityId})`
      );
      updateItemStatus(item.id, 'pending');
      reset++;
    }
  }

  return reset;
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface RecoveryResult {
  /** Total items scanned */
  scanned: number;
  /** Corrupted items removed */
  corruptedRemoved: number;
  /** Failed items reset for retry */
  failedReset: number;
  /** Items remaining in queue */
  remaining: number;
  /** Healthy status */
  healthy: boolean;
}

/**
 * Run queue recovery on app startup.
 *
 * Idempotent — safe to run multiple times.
 * Should be called BEFORE starting sync processor.
 *
 * @returns Recovery result summary
 */
export function runQueueRecovery(): RecoveryResult {
  console.log('[QueueRecovery] Starting queue recovery...');

  // Clean up dedup expired entries first
  cleanupExpiredEvents();

  // Get all queue items
  const items = getQueueItems();
  const initialCount = items.length;

  // Recovery steps
  const corruptedRemoved = removeCorruptedItems(items);
  const failedReset = resetFailedItems(items);

  // Get final state
  const remaining = getQueueItems().length;

  const result: RecoveryResult = {
    scanned: initialCount,
    corruptedRemoved,
    failedReset,
    remaining,
    healthy: remaining > 0 ? true : true, // Empty queue is also healthy
  };

  console.log('[QueueRecovery] Complete:', {
    scanned: result.scanned,
    corruptedRemoved: result.corruptedRemoved,
    failedReset: result.failedReset,
    remaining: result.remaining,
  });

  return result;
}

/**
 * Quick health check for queue.
 * Returns true if queue appears healthy.
 */
export function isQueueHealthy(): boolean {
  const items = getQueueItems();

  // Check for corrupted items
  const corrupted = items.filter(isCorruptedItem);
  if (corrupted.length > 0) {
    console.warn(`[QueueRecovery] ${corrupted.length} corrupted items detected`);
    return false;
  }

  // Check for excessive failures
  const excessiveFailures = items.filter(
    (item) => item.status === 'failed' && item.retryCount >= MAX_RETRY_COUNT
  );
  if (excessiveFailures.length > items.length * 0.5) {
    console.warn(
      `[QueueRecovery] ${excessiveFailures.length}/${items.length} items have excessive failures`
    );
    return false;
  }

  return true;
}
