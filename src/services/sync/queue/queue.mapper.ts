/**
 * Queue Mapper
 *
 * SINGLE source of truth for converting SyncQueueItem → SyncEvent.
 *
 * Architecture:
 *   Queue (MMKV) → Mapper → SyncEvent → Sync Processor → Supabase Adapter
 *
 * Responsibility:
 * - Convert queue storage format to event format
 * - No business logic
 * - No Supabase knowledge
 * - Pure data transformation
 */

import type { SyncQueueItem } from "../../storage/queue.types";
import type { SyncEvent } from "../types";

/**
 * Convert a SyncQueueItem to SyncEvent format.
 *
 * SINGLE CANONICAL conversion function.
 * All queue → event conversions MUST use this.
 *
 * @param item - Queue item from MMKV
 * @returns SyncEvent for processor/adapter
 */
export function mapQueueItemToEvent(item: SyncQueueItem): SyncEvent {
  return {
    entity: item.entity,
    operation: item.operation,
    entityId: item.entityId,
    payload: item.payload,
    idempotencyKey: item.idempotencyKey,
  };
}

/**
 * Get the idempotency key for a queue item.
 *
 * Uses the item's pre-stamped idempotencyKey (set at creation time).
 * This is the canonical dedup key — stable across replays.
 *
 * @param item - Queue item
 * @returns Idempotency key string
 */
export function generateEventKey(item: SyncQueueItem): string {
  return item.idempotencyKey;
}

/**
 * Generate idempotency key from SyncEvent.
 * Used by the dedup layer for event-based checking.
 *
 * @param event - Sync event
 * @returns Idempotency key string
 */
export function generateEventKeyFromEvent(event: SyncEvent): string {
  return (
    event.idempotencyKey ??
    `${event.entity}:${event.operation}:${event.entityId}`
  );
}
