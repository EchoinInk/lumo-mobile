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

import type { SyncQueueItem } from '../../storage/queue.types';
import type { SyncEvent } from '../syncEvent.types';

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
  };
}

/**
 * Generate an idempotency key for a queue item.
 * Used for deduplication.
 *
 * Format: `${entity}:${operation}:${entityId}`
 *
 * @param item - Queue item
 * @returns Idempotency key string
 */
export function generateEventKey(item: SyncQueueItem): string {
  return `${item.entity}:${item.operation}:${item.entityId}`;
}

/**
 * Generate idempotency key from SyncEvent.
 * Alternative for event-based deduplication.
 *
 * @param event - Sync event
 * @returns Idempotency key string
 */
export function generateEventKeyFromEvent(event: SyncEvent): string {
  return `${event.entity}:${event.operation}:${event.entityId}`;
}
