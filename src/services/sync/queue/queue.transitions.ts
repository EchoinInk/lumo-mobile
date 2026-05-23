/**
 * Queue State Transitions
 *
 * SINGLE canonical path for all queue item state mutations.
 * ALL status changes MUST go through this module.
 *
 * Rules:
 * - Never mutate queue status inline elsewhere in the app
 * - Every transition is validated before applying
 * - Replay metadata (lastAttemptAt, syncedAt) is stamped here
 * - Invalid transitions throw with a descriptive message
 *
 * State machine:
 *   pending → processing
 *   processing → synced       (success)
 *   processing → failed       (retryable error)
 *   processing → dead_letter  (max retries exceeded)
 *   processing → conflict     (server conflict detected)
 *   failed → processing       (retry)
 *   conflict → processing     (manual or automatic resolution retry)
 */

import type { QueueItemStatus } from "../../storage/queue.types";
import { getQueueItems, updateItemStatus } from "../../storage/syncQueue";
import { MAX_SYNC_RETRIES } from "../config";
import { validateTransition } from "../types";

// ── Internal helper ───────────────────────────────────────────────────────

/**
 * Apply a validated state transition.
 * Uses updateItemStatus for the actual MMKV write after validation.
 */
function applyTransition(
  itemId: string,
  to: QueueItemStatus,
  errorMessage?: string,
): void {
  const queue = getQueueItems();
  const item = queue.find((i) => i.id === itemId);

  if (!item) {
    console.warn(
      `[QueueTransitions] Item ${itemId} not found — transition to ${to} skipped`,
    );
    return;
  }

  const validation = validateTransition(item, to);

  if (!validation.valid) {
    throw new Error(
      `[QueueTransitions] Invalid transition for ${itemId} (${item.status} → ${to}): ${validation.reason}`,
    );
  }

  updateItemStatus(itemId, to, errorMessage);
}

// ── Public Transitions ────────────────────────────────────────────────────

/**
 * Mark an item as currently being processed.
 * Stamps lastAttemptAt with current time.
 */
export function markQueueItemProcessing(itemId: string): void {
  applyTransition(itemId, "processing", { lastAttemptAt: Date.now() });
}

/**
 * Mark an item as successfully synced to backend.
 * Stamps syncedAt, clears error.
 */
export function markQueueItemSynced(itemId: string): void {
  applyTransition(itemId, "synced", {
    syncedAt: Date.now(),
    error: null,
  });
}

/**
 * Mark an item as failed (retryable).
 * Increments retryCount. If retryCount reaches MAX_SYNC_RETRIES,
 * automatically transitions to dead_letter instead.
 */
export function markQueueItemFailed(
  itemId: string,
  errorMessage: string,
): void {
  const queue = loadQueue();
  const item = queue.find((i) => i.id === itemId);
  if (!item) {
    console.warn(
      `[QueueTransitions] Item ${itemId} not found — markFailed skipped`,
    );
    return;
  }

  const newRetryCount = item.retryCount + 1;

  if (newRetryCount >= MAX_SYNC_RETRIES) {
    applyTransition(itemId, "dead_letter", {
      retryCount: newRetryCount,
      error: errorMessage,
      lastAttemptAt: Date.now(),
    });
  } else {
    applyTransition(itemId, "failed", {
      retryCount: newRetryCount,
      error: errorMessage,
      lastAttemptAt: Date.now(),
    });
  }
}

/**
 * Mark an item as having a server-side conflict.
 * Does NOT increment retryCount — conflict is not a retry failure.
 */
export function markQueueItemConflict(
  itemId: string,
  errorMessage: string,
): void {
  applyTransition(itemId, "conflict", {
    error: errorMessage,
    lastAttemptAt: Date.now(),
  });
}

/**
 * Directly mark an item as dead letter (bypass retry logic).
 * Use only when max retries are confirmed exceeded or for non-retryable errors.
 */
export function markQueueItemDeadLetter(itemId: string, reason: string): void {
  applyTransition(itemId, "dead_letter", {
    error: reason,
    lastAttemptAt: Date.now(),
  });
}
