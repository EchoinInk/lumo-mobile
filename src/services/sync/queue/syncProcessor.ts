/**
 * Queue Sync Processor
 *
 * Processes pending sync events from MMKV queue to Supabase.
 * Phase 10.1: Enhanced with production-grade reliability.
 *
 * Architecture:
 *   Queue (MMKV) → Recovery → Dedup → Processor → Supabase Adapter → Supabase
 *
 * Phase 10.1 Enhancements:
 * - Processing guards (concurrency lock)
 * - Exponential backoff with jitter
 * - Dead letter handling (failed events tracked, not deleted)
 * - Dedup integration (prevent duplicate execution)
 *
 * Rules:
 * - FIFO processing (sequential)
 * - No parallel writes
 * - No UI blocking
 * - Graceful handling of Supabase not configured
 * - Idempotent-safe (duplicate events don't break backend)
 */

import type { SyncQueueItem } from "../../storage/queue.types";
import { observability } from "../../observability";
import { getPendingItems, removeItem } from "../../storage/syncQueue";
import { isSupabaseConfigured } from "../adapters/supabase/supabase.client";
import { supabaseSyncAdapter } from "../adapters/supabase/sync.adapter";
import { isRetryableError } from "../adapters/supabase/sync.retry";
import { MAX_SYNC_RETRIES } from "../config";
import { archiveDeadLetter } from "../deadLetter";
import { canRetryAttempt, getRetryDelay } from "../retry/retryPolicy";
import { canProcess, checkInvariants } from "../types";
import { isEventProcessed, markEventProcessed } from "./queue.dedup";
import { mapQueueItemToEvent } from "./queue.mapper";
import {
    markQueueItemDeadLetter,
    markQueueItemFailed,
    markQueueItemProcessing,
    markQueueItemSynced,
} from "./queue.transitions";

// ── Processing Guard ─────────────────────────────────────────────────────────

let isProcessing = false;
let processingLockId: string | null = null;

/**
 * Acquire processing lock.
 * Returns lock ID if acquired, null if already processing.
 */
function acquireLock(): string | null {
  if (isProcessing) {
    return null;
  }
  isProcessing = true;
  processingLockId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return processingLockId;
}

/**
 * Release processing lock.
 */
function releaseLock(): void {
  isProcessing = false;
  processingLockId = null;
}

/**
 * Sleep for specified milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process a single queue item deterministically.
 *
 * Flow:
 *   1. Validate invariants
 *   2. Check lifecycle (canProcess)
 *   3. Check idempotency (skip if already synced)
 *   4. Mark processing
 *   5. Attempt sync
 *   6. Transition state based on result
 *
 * @param item    - Queue item snapshot (read before lock)
 * @param attempt - 0-indexed retry attempt number
 * @returns true if the item was successfully synced or safely skipped
 */
async function processItem(item: SyncQueueItem, attempt = 0): Promise<boolean> {
  // 1. INVARIANT GUARD: reject malformed items
  const invariantCheck = checkInvariants(item);
  if (!invariantCheck.valid) {
    observability.logger.error(
      "[SyncProcessor] Invariant violations",
      {
        itemId: item.id,
        violations: invariantCheck.violations.join(", "),
      },
    );
    archiveDeadLetter(
      item,
      `Invariant violation: ${invariantCheck.violations.join("; ")}`,
    );
    removeItem(item.id);
    return false;
  }

  // 2. LIFECYCLE GUARD: skip items that cannot be processed
  if (!canProcess(item)) {
    observability.logger.warn("[SyncProcessor] Cannot process item", {
      itemId: item.id,
      status: item.status,
      retries: item.retryCount,
    });
    return false;
  }

  // 3. IDEMPOTENCY GUARD: skip if already synced (replay protection)
  if (isEventProcessed(item)) {
    observability.sync.recordQueueReplay(1, { skippedDuplicate: true });
    markQueueItemSynced(item.id);
    removeItem(item.id);
    return true;
  }

  // 4. RETRY EXHAUSTION: send straight to dead letter
  if (!canRetryAttempt(attempt)) {
    const reason = "Max retries exceeded";
    observability.logger.error("[SyncProcessor] Dead letter", {
      itemId: item.id,
      reason,
    });
    markQueueItemDeadLetter(item.id, reason);
    archiveDeadLetter(item, reason);
    return false;
  }

  // 5. MARK PROCESSING
  markQueueItemProcessing(item.id);

  try {
    const event = mapQueueItemToEvent(item);
    await supabaseSyncAdapter(event);

    // SUCCESS
    markEventProcessed(item);
    markQueueItemSynced(item.id);
    removeItem(item.id);
    observability.sync.recordSyncSuccess(`${item.entity}.${item.operation}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // NON-RETRYABLE: dead letter immediately
    if (!isRetryableError(error)) {
      observability.sync.recordSyncFailure(`${item.entity}.${item.operation}`, 0, {
        retryable: false,
      });
      observability.logger.error("[SyncProcessor] Non-retryable error", {
        itemId: item.id,
        message,
      });
      markQueueItemDeadLetter(item.id, message);
      archiveDeadLetter(item, message);
      return false;
    }

    // RETRYABLE: backoff and recurse
    const delay = getRetryDelay(attempt);
    observability.sync.recordQueueFailure(1, { retryable: true });
    observability.logger.warn("[SyncProcessor] Retry scheduled", {
      itemId: item.id,
      attempt: attempt + 1,
      delay,
      message,
    });
    markQueueItemFailed(item.id, message);
    await sleep(delay);
    return processItem(item, attempt + 1);
  }
}

/**
 * Process all pending sync queue items.
 *
 * Phase 10.1: Enhanced with:
 * - Processing guard (lock mechanism)
 * - Dead letter tracking
 * - Proper error classification
 *
 * @returns Processing result summary
 */
export interface SyncResult {
  processed: number;
  failed: number;
  deadLetter: number;
  skipped: number;
}

export async function processSyncQueue(): Promise<SyncResult> {
  // Acquire processing lock
  const lockId = acquireLock();
  if (!lockId) {
    observability.logger.debug("[SyncProcessor] Already processing, skipping");
    return { processed: 0, failed: 0, deadLetter: 0, skipped: 0 };
  }

  if (!isSupabaseConfigured()) {
    observability.logger.info("[SyncProcessor] Supabase not configured");
    releaseLock();
    return { processed: 0, failed: 0, deadLetter: 0, skipped: 0 };
  }

  const result: SyncResult = {
    processed: 0,
    failed: 0,
    deadLetter: 0,
    skipped: 0,
  };

  try {
    const pendingItems = getPendingItems();

    if (pendingItems.length === 0) {
      observability.logger.debug("[SyncProcessor] No pending items to sync");
      releaseLock();
      return result;
    }

    const processingStart = Date.now();
    observability.sync.recordQueueReplay(pendingItems.length, { lockId });

    for (const item of pendingItems) {
      // Dead letter items (exhausted retries) — counted but not retried
      if (
        item.status === "dead_letter" ||
        (item.status === "failed" && item.retryCount >= MAX_SYNC_RETRIES)
      ) {
        result.deadLetter++;
        continue;
      }

      const success = await processItem(item);
      if (success) {
        result.processed++;
      } else {
        result.failed++;
      }
    }

    const duration = Date.now() - processingStart;
    if (result.failed > 0 || result.deadLetter > 0) {
      observability.sync.recordSyncFailure("queue_processing", duration, result);
    } else {
      observability.sync.recordSyncSuccess("queue_processing", duration, result);
    }
  } catch (error) {
    observability.crashes.captureException(error, {
      feature: "sync_queue_processing",
    });
  } finally {
    releaseLock();
  }

  return result;
}

/**
 * Check if the processor is currently running.
 */
export function isSyncQueueProcessing(): boolean {
  return isProcessing;
}

/**
 * Get the current processing lock ID (for debugging).
 */
export function getProcessingLockId(): string | null {
  return processingLockId;
}

/**
 * Get count of pending sync items.
 */
export function getPendingSyncCount(): number {
  return getPendingItems().length;
}

/**
 * Get count of dead-letter items (failed, max retries exceeded).
 */
export function getDeadLetterCount(): number {
  return getPendingItems().filter(
    (item) =>
      item.status === "dead_letter" ||
      (item.status === "failed" && item.retryCount >= MAX_SYNC_RETRIES),
  ).length;
}

/**
 * Start background sync processing.
 * Call this when network comes online or app starts.
 *
 * Non-blocking — runs in background.
 */
export function startBackgroundSync(): void {
  // Don't await — run in background
  processSyncQueue().catch((err) => {
    console.error("[SyncProcessor] Background sync failed:", err);
  });
}

/**
 * Force release the processing lock.
 * Use with caution — only for crash recovery scenarios.
 */
export function forceReleaseLock(): void {
  if (isProcessing) {
    observability.logger.warn("[SyncProcessor] Force releasing processing lock");
    releaseLock();
  }
}
