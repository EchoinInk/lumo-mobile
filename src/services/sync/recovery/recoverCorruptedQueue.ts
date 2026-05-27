/**
 * Recover Corrupted Queue
 *
 * Detects and recovers corrupted sync queue items.
 * Defensive queue recovery, hydration-safe, migration-safe.
 */

import { storageInstance as mmkvStorage } from "../../../store/storage";
import type { SyncQueueItem } from "../../storage/queue.types";

const SYNC_QUEUE_KEY = "sync_queue";

/**
 * Detect corrupted queue items.
 *
 * @returns Array of corrupted item IDs
 */
export function detectCorruptedQueueItems(): string[] {
  if (!mmkvStorage) {
    return [];
  }

  const queueData = mmkvStorage.getString(SYNC_QUEUE_KEY);
  if (!queueData) {
    return [];
  }

  try {
    const queue: SyncQueueItem[] = JSON.parse(queueData);
    const corruptedIds: string[] = [];

    for (const item of queue) {
      // Check for required fields
      if (!item.id || !item.entity || !item.operation || !item.entityId) {
        corruptedIds.push(item.id || "unknown");
        continue;
      }

      // Check for valid timestamp
      if (!item.timestamp || isNaN(Date.parse(item.timestamp))) {
        corruptedIds.push(item.id);
        continue;
      }

      // Check for valid status
      if (
        !["pending", "processing", "synced", "failed", "conflict", "dead_letter", "completed"].includes(
          item.status,
        )
      ) {
        corruptedIds.push(item.id);
        continue;
      }

      // Check for valid owner type
      if (!["guest", "authenticated"].includes(item.ownerType)) {
        corruptedIds.push(item.id);
        continue;
      }
    }

    return corruptedIds;
  } catch (err) {
    console.error("[detectCorruptedQueueItems] Failed to parse queue:", err);
    return [];
  }
}

/**
 * Remove corrupted queue items.
 *
 * @returns Number of items removed
 */
export function removeCorruptedQueueItems(): number {
  if (!mmkvStorage) {
    return 0;
  }

  const queueData = mmkvStorage.getString(SYNC_QUEUE_KEY);
  if (!queueData) {
    return 0;
  }

  try {
    const queue: SyncQueueItem[] = JSON.parse(queueData);
    const corruptedIds = detectCorruptedQueueItems();

    if (corruptedIds.length === 0) {
      return 0;
    }

    const filteredQueue = queue.filter((item) => !corruptedIds.includes(item.id));
    const removedCount = queue.length - filteredQueue.length;

    mmkvStorage.set(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));

    console.log(`[removeCorruptedQueueItems] Removed ${removedCount} corrupted items`);

    return removedCount;
  } catch (err) {
    console.error("[removeCorruptedQueueItems] Failed to parse queue:", err);
    return 0;
  }
}

/**
 * Validate queue integrity.
 *
 * @returns Whether the queue is valid
 */
export function validateQueueIntegrity(): boolean {
  const corruptedIds = detectCorruptedQueueItems();
  return corruptedIds.length === 0;
}
