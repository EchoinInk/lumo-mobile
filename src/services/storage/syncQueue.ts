/**
 * Sync Queue Storage
 *
 * Local-only queue infrastructure for recording sync operations.
 * Persists to MMKV immediately - survives app restarts.
 *
 * Architecture:
 *   UI → Zustand → Repository → MMKV → Sync Queue
 *
 * This phase: queue recording + persistence only
 * Future phase: actual sync execution with Supabase
 */

import { getString, setString } from "./mmkv";
import {
    CreateQueueItemInput,
    MAX_RETRY_COUNT,
    QueueItemStatus,
    SYNC_QUEUE_STORAGE_KEY,
    SyncQueueItem,
} from "./queue.types";

// ── Private helpers ────────────────────────────────────────────────────────

function generateId(): string {
  return `queue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Load the full queue from MMKV.
 * Returns empty array if not found or parse error.
 */
function loadQueue(): SyncQueueItem[] {
  try {
    const raw = getString(SYNC_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SyncQueueItem[];
  } catch (err) {
    console.error("[SyncQueue] Failed to load queue:", err);
    return [];
  }
}

/**
 * Persist the full queue to MMKV.
 */
function persistQueue(items: SyncQueueItem[]): void {
  try {
    setString(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("[SyncQueue] Failed to persist queue:", err);
  }
}

// ── Queue Operations ───────────────────────────────────────────────────────

/**
 * Record a new sync operation in the queue.
 * Immediately persists to MMKV.
 *
 * @param input - Queue item data (without generated fields)
 * @returns The created queue item
 *
 * @example
 * const item = recordQueueItem({
 *   entity: 'task',
 *   operation: 'create',
 *   entityId: task.id,
 *   payload: { title: 'New Task' }
 * });
 */
export function recordQueueItem(input: CreateQueueItemInput): SyncQueueItem {
  const item: SyncQueueItem = {
    id: generateId(),
    userId: input.userId ?? null,
    entity: input.entity,
    operation: input.operation,
    entityId: input.entityId,
    timestamp: now(),
    payload: input.payload,
    retryCount: 0,
    status: "pending",
    error: null,
  };

  const queue = loadQueue();
  queue.push(item);
  persistQueue(queue);

  return item;
}

/**
 * Get all queue items.
 * Returns copy of queue state from MMKV.
 */
export function getQueueItems(): SyncQueueItem[] {
  return loadQueue();
}

/**
 * Get queue items filtered by status.
 */
export function getQueueItemsByStatus(
  status: QueueItemStatus,
): SyncQueueItem[] {
  return loadQueue().filter((item) => item.status === status);
}

/**
 * Get all pending items (ready for processing).
 * Excludes failed items that have exceeded retry limit.
 */
export function getPendingItems(): SyncQueueItem[] {
  return loadQueue().filter(
    (item) => item.status === "pending" && item.retryCount < MAX_RETRY_COUNT,
  );
}

/**
 * Get failed items that have exceeded retry limit.
 */
export function getFailedItems(): SyncQueueItem[] {
  return loadQueue().filter(
    (item) => item.status === "failed" || item.retryCount >= MAX_RETRY_COUNT,
  );
}

/**
 * Update an item's status.
 * Used during sync processing.
 */
export function updateItemStatus(
  itemId: string,
  status: QueueItemStatus,
  error?: string,
): void {
  const queue = loadQueue().map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      status,
      error: error ?? item.error,
    };
  });
  persistQueue(queue);
}

/**
 * Increment retry count for an item.
 * Automatically marks as failed if max retries exceeded.
 */
export function incrementRetry(itemId: string, errorMessage: string): void {
  const queue = loadQueue().map((item) => {
    if (item.id !== itemId) return item;

    const newRetryCount = item.retryCount + 1;
    const newStatus: QueueItemStatus =
      newRetryCount >= MAX_RETRY_COUNT ? "failed" : "pending";

    return {
      ...item,
      retryCount: newRetryCount,
      status: newStatus,
      error: errorMessage,
    };
  });
  persistQueue(queue);
}

/**
 * Remove a completed item from the queue.
 */
export function removeItem(itemId: string): void {
  const queue = loadQueue().filter((item) => item.id !== itemId);
  persistQueue(queue);
}

/**
 * Mark an item as completed and remove it from the queue.
 */
export function markCompleted(itemId: string): void {
  removeItem(itemId);
}

/**
 * Clear all completed items from the queue.
 * (Items marked completed are already removed, so this is a no-op
 * but kept for API consistency.)
 */
export function clearCompleted(): void {
  // Completed items are removed immediately, so nothing to clear
  // This function exists for API consistency with other queue implementations
}

/**
 * Clear the entire queue. Use with caution.
 */
export function clearQueue(): void {
  persistQueue([]);
}

/**
 * Get the count of pending items.
 */
export function getPendingCount(): number {
  return getPendingItems().length;
}

/**
 * Check if there are any pending operations.
 */
export function hasPendingOperations(): boolean {
  return getPendingCount() > 0;
}

/**
 * Get items for a specific entity.
 */
export function getItemsByEntity(entity: string): SyncQueueItem[] {
  return loadQueue().filter((item) => item.entity === entity);
}

/**
 * Get items for a specific entity ID.
 */
export function getItemsByEntityId(entityId: string): SyncQueueItem[] {
  return loadQueue().filter((item) => item.entityId === entityId);
}

/**
 * Remove all items for a specific entity ID.
 * Useful when an entity is permanently deleted.
 */
export function removeItemsByEntityId(entityId: string): void {
  const queue = loadQueue().filter((item) => item.entityId !== entityId);
  persistQueue(queue);
}
