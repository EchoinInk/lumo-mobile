/**
 * Offline Queue
 *
 * Manages operations that need to be queued when offline.
 * Ensures operations are replayed when connection is restored.
 */

import { storageInstance as mmkvStorage } from "../../store/storage";

const OFFLINE_QUEUE_KEY = "offline_queue";

/**
 * Offline queue item.
 */
export interface OfflineQueueItem {
  /** Unique item ID */
  id: string;
  /** Operation type */
  operation: string;
  /** Operation payload */
  payload: unknown;
  /** Timestamp when queued */
  timestamp: string;
  /** Whether item has been replayed */
  replayed: boolean;
}

/**
 * Queue an operation for offline replay.
 *
 * @param operation - Operation type
 * @param payload - Operation payload
 * @returns Item ID
 */
export function queueOfflineOperation(operation: string, payload: unknown): string {
  if (!mmkvStorage) {
    console.warn("[queueOfflineOperation] MMKV storage not available");
    return "";
  }

  const item: OfflineQueueItem = {
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    operation,
    payload,
    timestamp: new Date().toISOString(),
    replayed: false,
  };

  const queueData = mmkvStorage.getString(OFFLINE_QUEUE_KEY);
  let queue: OfflineQueueItem[] = [];

  if (queueData) {
    try {
      queue = JSON.parse(queueData);
    } catch (err) {
      console.error("[queueOfflineOperation] Failed to parse queue:", err);
    }
  }

  queue.push(item);
  mmkvStorage.set(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

  console.log(`[queueOfflineOperation] Queued operation ${item.id}`);

  return item.id;
}

/**
 * Get all offline queue items.
 *
 * @returns Array of offline queue items
 */
export function getOfflineQueueItems(): OfflineQueueItem[] {
  if (!mmkvStorage) {
    return [];
  }

  const queueData = mmkvStorage.getString(OFFLINE_QUEUE_KEY);
  if (!queueData) {
    return [];
  }

  try {
    return JSON.parse(queueData);
  } catch (err) {
    console.error("[getOfflineQueueItems] Failed to parse queue:", err);
    return [];
  }
}

/**
 * Get unreplayed offline queue items.
 *
 * @returns Array of unreplayed items
 */
export function getUnreplayedOfflineItems(): OfflineQueueItem[] {
  return getOfflineQueueItems().filter((item) => !item.replayed);
}

/**
 * Mark offline queue item as replayed.
 *
 * @param itemId - Item ID
 * @returns Whether the item was found and marked
 */
export function markOfflineItemReplayed(itemId: string): boolean {
  if (!mmkvStorage) {
    return false;
  }

  const queueData = mmkvStorage.getString(OFFLINE_QUEUE_KEY);
  if (!queueData) {
    return false;
  }

  try {
    const queue: OfflineQueueItem[] = JSON.parse(queueData);
    const item = queue.find((i) => i.id === itemId);

    if (item) {
      item.replayed = true;
      mmkvStorage.set(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`[markOfflineItemReplayed] Marked item ${itemId} as replayed`);
      return true;
    }

    return false;
  } catch (err) {
    console.error("[markOfflineItemReplayed] Failed to parse queue:", err);
    return false;
  }
}

/**
 * Clear replayed offline queue items.
 *
 * @returns Number of items cleared
 */
export function clearReplayedOfflineItems(): number {
  if (!mmkvStorage) {
    return 0;
  }

  const queueData = mmkvStorage.getString(OFFLINE_QUEUE_KEY);
  if (!queueData) {
    return 0;
  }

  try {
    const queue: OfflineQueueItem[] = JSON.parse(queueData);
    const filteredQueue = queue.filter((item) => !item.replayed);
    const clearedCount = queue.length - filteredQueue.length;

    mmkvStorage.set(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));

    console.log(`[clearReplayedOfflineItems] Cleared ${clearedCount} items`);

    return clearedCount;
  } catch (err) {
    console.error("[clearReplayedOfflineItems] Failed to parse queue:", err);
    return 0;
  }
}

/**
 * Clear all offline queue items.
 *
 * @returns Number of items cleared
 */
export function clearOfflineQueue(): number {
  if (!mmkvStorage) {
    return 0;
  }

  const queueData = mmkvStorage.getString(OFFLINE_QUEUE_KEY);
  if (!queueData) {
    return 0;
  }

  try {
    const queue: OfflineQueueItem[] = JSON.parse(queueData);
    const count = queue.length;

    mmkvStorage.delete(OFFLINE_QUEUE_KEY);

    console.log(`[clearOfflineQueue] Cleared ${count} items`);

    return count;
  } catch (err) {
    console.error("[clearOfflineQueue] Failed to parse queue:", err);
    return 0;
  }
}
