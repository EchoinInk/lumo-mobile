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
import { MAX_RETRY_COUNT } from "../../storage/queue.types";
import {
    getPendingItems,
    incrementRetry,
    removeItem,
    updateItemStatus,
} from "../../storage/syncQueue";
import { isSupabaseConfigured } from "../adapters/supabase/supabase.client";
import { supabaseSyncAdapter } from "../adapters/supabase/sync.adapter";
import { isRetryableError } from "../adapters/supabase/sync.retry";
import {
    SYNC_RETRY_BASE_DELAY,
    SYNC_RETRY_JITTER_FACTOR,
    SYNC_RETRY_MAX_DELAY,
} from "../config";
import { isEventProcessed, markEventProcessed } from "./queue.dedup";
import { mapQueueItemToEvent } from "./queue.mapper";

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

// ── Retry Backoff with Jitter ──────────────────────────────────────────────

/**
 * Calculate exponential backoff delay with jitter.
 *
 * attempt 1 → 1s + jitter
 * attempt 2 → 2s + jitter
 * attempt 3 → 4s + jitter
 * attempt 4 → 8s + jitter
 * attempt 5 → stop (dead letter)
 *
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function calculateBackoffDelay(attempt: number): number {
  // Exponential: base * 2^attempt
  const exponential = SYNC_RETRY_BASE_DELAY * Math.pow(2, attempt);
  const capped = Math.min(exponential, SYNC_RETRY_MAX_DELAY);

  // Add jitter: ±factor%
  const jitter = capped * SYNC_RETRY_JITTER_FACTOR * (Math.random() * 2 - 1);

  return Math.max(0, Math.floor(capped + jitter));
}

/**
 * Sleep for specified milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process a single queue item with dedup and backoff.
 *
 * Phase 10.1: Enhanced with:
 * - Deduplication check (skip if already processed)
 * - Exponential backoff with jitter
 * - Dead letter handling (mark failed, don't delete)
 *
 * @param item - Queue item to process
 * @param attempt - Current retry attempt (0-indexed)
 * @returns true if successful, false if failed
 */
async function processItem(item: SyncQueueItem, attempt = 0): Promise<boolean> {
  // DEDUP: Skip if already processed
  if (isEventProcessed(item)) {
    console.log(
      `[SyncProcessor] Skipping already-processed event: ${item.entity}:${item.operation} (${item.entityId})`,
    );
    // Remove from queue (it's a duplicate)
    removeItem(item.id);
    return true;
  }

  // Check if max retries exceeded (dead letter state)
  if (attempt >= MAX_RETRY_COUNT) {
    console.error(
      `[SyncProcessor] Max retries exceeded for ${item.entity}:${item.operation} (${item.entityId}) — moved to dead letter`,
    );
    // Mark as failed (dead letter) — do NOT remove from queue
    updateItemStatus(item.id, "failed", "Max retries exceeded");
    return false;
  }

  try {
    // Convert and dispatch to Supabase
    const event = mapQueueItemToEvent(item);

    // Direct call (retry logic is handled by this processor now)
    await supabaseSyncAdapter(event);

    // Success: mark as processed (dedup) and remove from queue
    markEventProcessed(item);
    removeItem(item.id);
    console.log(
      `[SyncProcessor] Synced ${item.entity}:${item.operation} (${item.entityId})`,
    );
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Non-retryable error — mark as failed immediately (dead letter)
    if (!isRetryableError(error)) {
      console.error(
        `[SyncProcessor] Non-retryable error for ${item.entity}:${item.operation}:`,
        message,
      );
      // Mark as failed with reason — do NOT remove from queue
      updateItemStatus(item.id, "failed", message);
      return false;
    }

    // Retryable error: apply backoff and retry
    const delay = calculateBackoffDelay(attempt);
    console.warn(
      `[SyncProcessor] Retryable error for ${item.entity}:${item.operation}, retry ${attempt + 1}/${MAX_RETRY_COUNT} in ${delay}ms:`,
    );

    // Increment retry count in storage
    incrementRetry(item.id, message);

    // Wait before retry
    await sleep(delay);

    // Recursive retry
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
    console.log("[SyncProcessor] Already processing, skipping");
    return { processed: 0, failed: 0, deadLetter: 0, skipped: 0 };
  }

  if (!isSupabaseConfigured()) {
    console.log("[SyncProcessor] Supabase not configured, skipping sync");
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
      console.log("[SyncProcessor] No pending items to sync");
      releaseLock();
      return result;
    }

    console.log(
      `[SyncProcessor] Processing ${pendingItems.length} pending items (lock: ${lockId})`,
    );

    for (const item of pendingItems) {
      // Check if already in dead letter state (skip)
      if (item.status === "failed" && item.retryCount >= MAX_RETRY_COUNT) {
        result.deadLetter++;
        continue;
      }

      // Check if already processed (dedup)
      if (isEventProcessed(item)) {
        result.skipped++;
        removeItem(item.id);
        continue;
      }

      const success = await processItem(item);
      if (success) {
        result.processed++;
      } else {
        result.failed++;
      }
    }

    console.log(
      `[SyncProcessor] Completed: ${result.processed} synced, ${result.failed} failed, ${result.deadLetter} dead-letter, ${result.skipped} skipped`,
    );
  } catch (error) {
    console.error("[SyncProcessor] Unexpected error during processing:", error);
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
    (item) => item.status === "failed" && item.retryCount >= MAX_RETRY_COUNT,
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
    console.warn("[SyncProcessor] Force releasing processing lock");
    releaseLock();
  }
}
