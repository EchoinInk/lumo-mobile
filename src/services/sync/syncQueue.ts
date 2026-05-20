/**
 * Sync Queue
 *
 * Persistent queue for offline-first sync operations.
 * Operations are stored in MMKV and processed when online.
 *
 * Architecture:
 *   MMKV → Repository → Sync Queue → Supabase
 *
 * Queue entries persist across app restarts.
 * Processing respects network state and retry limits.
 */

import { getItem, setItem } from '@/store/storage';
import type {
    SyncEntityType,
    SyncOperationType,
    SyncQueueEntry,
    SyncStatus,
} from '@/types/sync';
import { MAX_SYNC_RETRIES } from '@/types/sync';

const SYNC_QUEUE_KEY = 'sync_queue_entries';

/**
 * Generate a unique ID for queue entries.
 */
function generateId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load the full queue from MMKV.
 */
export function loadQueue(): SyncQueueEntry[] {
  return getItem<SyncQueueEntry[]>(SYNC_QUEUE_KEY) ?? [];
}

/**
 * Persist the queue to MMKV.
 */
function persistQueue(entries: SyncQueueEntry[]): void {
  setItem(SYNC_QUEUE_KEY, entries);
}

/**
 * Enqueue a new sync operation.
 * Immediately persists to MMKV so it survives app restarts.
 */
export function enqueue(params: {
  entityType: SyncEntityType;
  operationType: SyncOperationType;
  entityId: string;
  payload: Record<string, unknown>;
  entityVersion?: number;
}): SyncQueueEntry {
  const entry: SyncQueueEntry = {
    id: generateId(),
    entityType: params.entityType,
    operationType: params.operationType,
    entityId: params.entityId,
    payload: params.payload,
    entityVersion: params.entityVersion,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };

  const queue = loadQueue();
  queue.push(entry);
  persistQueue(queue);

  return entry;
}

/**
 * Get all pending entries ready for processing.
 * Filters out completed and over-retried entries.
 */
export function getPendingEntries(): SyncQueueEntry[] {
  return loadQueue().filter(
    (entry) =>
      entry.status === 'pending' &&
      entry.retryCount < MAX_SYNC_RETRIES
  );
}

/**
 * Get all failed entries that have exhausted retries.
 */
export function getFailedEntries(): SyncQueueEntry[] {
  return loadQueue().filter(
    (entry) =>
      entry.status === 'failed' ||
      entry.retryCount >= MAX_SYNC_RETRIES
  );
}

/**
 * Mark an entry as processing.
 */
export function markProcessing(entryId: string): void {
  updateEntryStatus(entryId, 'processing');
}

/**
 * Mark an entry as completed and remove it from the queue.
 */
export function markCompleted(entryId: string): void {
  const queue = loadQueue().filter((entry) => entry.id !== entryId);
  persistQueue(queue);
}

/**
 * Mark an entry as failed with an error message.
 * Increments retry count.
 */
export function markFailed(entryId: string, error: string): void {
  const queue = loadQueue().map((entry) => {
    if (entry.id !== entryId) return entry;

    const retryCount = entry.retryCount + 1;
    const status: SyncStatus =
      retryCount >= MAX_SYNC_RETRIES ? 'failed' : 'pending';

    return {
      ...entry,
      status,
      retryCount,
      lastError: error,
      lastAttemptAt: new Date().toISOString(),
    };
  });

  persistQueue(queue);
}

/**
 * Update an entry's status.
 */
function updateEntryStatus(entryId: string, status: SyncStatus): void {
  const queue = loadQueue().map((entry) =>
    entry.id === entryId ? { ...entry, status } : entry
  );
  persistQueue(queue);
}

/**
 * Clear all completed entries from the queue.
 */
export function clearCompleted(): void {
  const queue = loadQueue().filter((entry) => entry.status !== 'completed');
  persistQueue(queue);
}

/**
 * Clear the entire queue. Use with caution.
 */
export function clearQueue(): void {
  persistQueue([]);
}

/**
 * Get the total number of pending operations.
 */
export function getPendingCount(): number {
  return getPendingEntries().length;
}

/**
 * Check if there are any operations waiting to sync.
 */
export function hasPendingOperations(): boolean {
  return getPendingCount() > 0;
}
