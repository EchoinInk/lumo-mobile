/**
 * Replay Failed Queue
 *
 * Replays failed sync queue items with retry-safe logic.
 * Idempotent, no duplicated writes, defensive queue recovery.
 */

import { storageInstance as mmkvStorage } from "../../../store/storage";
import type { SyncQueueItem } from "../../storage/queue.types";

const SYNC_QUEUE_KEY = "sync_queue";

/**
 * Replay failed sync queue items.
 *
 * @param maxRetries - Maximum number of retries per item (default: 3)
 * @returns Number of items successfully replayed
 */
export async function replayFailedQueue(
  maxRetries: number = 3,
): Promise<number> {
  if (!mmkvStorage) {
    console.warn("[replayFailedQueue] MMKV storage not available");
    return 0;
  }

  const queueData = mmkvStorage.getString(SYNC_QUEUE_KEY);
  if (!queueData) {
    return 0;
  }

  let queue: SyncQueueItem[];
  try {
    queue = JSON.parse(queueData);
  } catch (err) {
    console.error("[replayFailedQueue] Failed to parse queue:", err);
    return 0;
  }

  const failedItems = queue.filter(
    (item) => item.status === "failed" && (item.retryCount || 0) < maxRetries,
  );

  if (failedItems.length === 0) {
    return 0;
  }

  let successCount = 0;

  for (const item of failedItems) {
    try {
      // Increment retry count
      item.retryCount = (item.retryCount || 0) + 1;
      item.status = "pending";
      item.lastAttemptAt = Date.now();

      successCount++;
    } catch (err) {
      console.error(
        `[replayFailedQueue] Failed to replay item ${item.id}:`,
        err,
      );
      item.status = "failed";
      item.error = err instanceof Error ? err.message : String(err);
    }
  }

  // Save updated queue
  mmkvStorage.set(SYNC_QUEUE_KEY, JSON.stringify(queue));

  console.log(`[replayFailedQueue] Replayed ${successCount} items`);

  return successCount;
}

/**
 * Get failed queue items.
 *
 * @returns Array of failed queue items
 */
export function getFailedQueueItems(): SyncQueueItem[] {
  if (!mmkvStorage) {
    return [];
  }

  const queueData = mmkvStorage.getString(SYNC_QUEUE_KEY);
  if (!queueData) {
    return [];
  }

  try {
    const queue: SyncQueueItem[] = JSON.parse(queueData);
    return queue.filter((item) => item.status === "failed");
  } catch (err) {
    console.error("[getFailedQueueItems] Failed to parse queue:", err);
    return [];
  }
}

/**
 * Clear failed queue items.
 *
 * @param olderThanMs - Only clear items older than this many milliseconds (optional)
 * @returns Number of items cleared
 */
export function clearFailedQueueItems(olderThanMs?: number): number {
  if (!mmkvStorage) {
    return 0;
  }

  const queueData = mmkvStorage.getString(SYNC_QUEUE_KEY);
  if (!queueData) {
    return 0;
  }

  try {
    const queue: SyncQueueItem[] = JSON.parse(queueData);
    const now = Date.now();

    const filteredQueue = queue.filter((item) => {
      if (item.status !== "failed") {
        return true;
      }

      if (olderThanMs) {
        const itemAge = now - new Date(item.updatedAt).getTime();
        return itemAge < olderThanMs;
      }

      return false;
    });

    const clearedCount = queue.length - filteredQueue.length;
    mmkvStorage.set(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));

    console.log(`[clearFailedQueueItems] Cleared ${clearedCount} items`);

    return clearedCount;
  } catch (err) {
    console.error("[clearFailedQueueItems] Failed to parse queue:", err);
    return 0;
  }
}
