/**
 * Sync Processor
 *
 * Processes queued sync operations against Supabase.
 * Runs when the app comes online or on-demand.
 *
 * Architecture:
 *   Network comes online → processQueue() → iterate entries → call API → mark result
 *
 * This is a scaffold — entity-specific handlers will be registered
 * as features are connected to the backend.
 */

import type { SyncEntityType, SyncQueueEntry, SyncResult } from '@/types/sync';
import { isOnline, onConnectivityChange } from '@/utils/network';
import { withRetry } from '@/utils/retry';
import {
    getPendingEntries,
    markCompleted,
    markFailed,
    markProcessing,
} from './syncQueue';

/**
 * Handler function type for processing a single sync entry.
 * Each entity type registers its own handler.
 */
type SyncHandler = (entry: SyncQueueEntry) => Promise<void>;

/**
 * Post-sync callback — invoked after a successful sync.
 * Used to clear pendingSync / stamp lastSyncedAt on entities.
 */
type PostSyncCallback = (entityId: string) => Promise<void>;

/**
 * Registry of sync handlers by entity type.
 * Features register their handlers here at initialization.
 */
const handlers = new Map<SyncEntityType, SyncHandler>();

/**
 * Registry of post-sync callbacks by entity type.
 * Called after successful sync to update entity metadata.
 */
const postSyncCallbacks = new Map<SyncEntityType, PostSyncCallback>();

let isProcessing = false;
let unsubNetwork: (() => void) | null = null;

/**
 * Register a sync handler for a given entity type.
 * Called during feature initialization.
 *
 * @param entityType - The entity type to handle
 * @param handler - Async function that performs the remote sync operation
 * @param onSynced - Optional callback invoked after successful sync (e.g. to clear pendingSync)
 *
 * @example
 * registerSyncHandler('task', async (entry) => {
 *   if (entry.operationType === 'create') {
 *     await supabase.from('tasks').insert(entry.payload);
 *   }
 * }, async (entityId) => {
 *   await taskLocalRepository.markSynced(entityId);
 * });
 */
export function registerSyncHandler(
  entityType: SyncEntityType,
  handler: SyncHandler,
  onSynced?: PostSyncCallback
): void {
  handlers.set(entityType, handler);
  if (onSynced) {
    postSyncCallbacks.set(entityType, onSynced);
  }
}

/**
 * Process all pending sync queue entries.
 * Skips if offline or already processing.
 * Processes entries sequentially to maintain order.
 */
export async function processQueue(): Promise<SyncResult[]> {
  if (isProcessing) return [];
  if (!isOnline()) return [];

  isProcessing = true;
  const results: SyncResult[] = [];

  try {
    const entries = getPendingEntries();

    for (const entry of entries) {
      // Stop processing if we go offline mid-queue
      if (!isOnline()) break;

      const result = await processEntry(entry);
      results.push(result);
    }
  } finally {
    isProcessing = false;
  }

  return results;
}

/**
 * Process a single queue entry with retry logic.
 */
async function processEntry(entry: SyncQueueEntry): Promise<SyncResult> {
  const handler = handlers.get(entry.entityType);

  if (!handler) {
    // No handler registered — mark as failed with clear message
    markFailed(
      entry.id,
      `No sync handler registered for entity type: ${entry.entityType}`
    );
    return {
      success: false,
      entryId: entry.id,
      error: `No handler for ${entry.entityType}`,
    };
  }

  markProcessing(entry.id);

  try {
    await withRetry(() => handler(entry), {
      maxAttempts: 2,
      baseDelay: 500,
      onRetry: (attempt, error) => {
        console.warn(
          `[Sync] Retry ${attempt} for ${entry.entityType}:${entry.operationType}`,
          error
        );
      },
    });

    markCompleted(entry.id);

    // Clear entity-level sync metadata (pendingSync, lastSyncedAt)
    const onSynced = postSyncCallbacks.get(entry.entityType);
    if (onSynced && entry.operationType !== 'delete') {
      try {
        await onSynced(entry.entityId);
      } catch (cbError) {
        // Non-fatal — queue entry is already completed
        console.warn('[Sync] Post-sync callback failed:', cbError);
      }
    }

    return { success: true, entryId: entry.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown sync error';
    markFailed(entry.id, message);
    return { success: false, entryId: entry.id, error: message };
  }
}

/**
 * Start automatic sync processing.
 * Listens for network connectivity changes and processes queue when online.
 * Call once at app startup.
 */
export function startSyncProcessor(): void {
  if (unsubNetwork) return; // Already started

  unsubNetwork = onConnectivityChange((online) => {
    if (online) {
      processQueue().catch((error) => {
        console.error('[Sync] Background processing failed:', error);
      });
    }
  });

  // Process immediately if currently online
  if (isOnline()) {
    processQueue().catch((error) => {
      console.error('[Sync] Initial processing failed:', error);
    });
  }
}

/**
 * Stop automatic sync processing.
 */
export function stopSyncProcessor(): void {
  if (unsubNetwork) {
    unsubNetwork();
    unsubNetwork = null;
  }
}

/**
 * Check if the processor is currently running.
 */
export function isSyncProcessing(): boolean {
  return isProcessing;
}
