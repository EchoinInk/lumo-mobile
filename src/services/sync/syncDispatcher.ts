/**
 * Sync Dispatcher
 *
 * Canonical entry point for the sync event pipeline.
 *
 * Architecture:
 *   UI → Store → Repository → Event Builder → Dispatcher → Queue → MMKV
 *
 * Principle: Exactly ONE way to dispatch sync events.
 *
 * Usage:
 *   dispatch({
 *     entity: 'task',
 *     operation: 'create',
 *     entityId: task.id,
 *     payload: { title: task.title }
 *   });
 */

import { recordQueueItem } from "../storage/syncQueue";
import { SyncDispatchResult, SyncEvent } from "./syncEvent.types";

/**
 * Dispatch a sync event to the queue.
 *
 * This is the SINGLE CANONICAL entry point for all sync operations.
 * All sync events flow through this function.
 *
 * @param event - The sync event to dispatch
 * @returns Dispatch result with queue item ID or error
 *
 * @example
 * dispatch({
 *   entity: 'task',
 *   operation: 'create',
 *   entityId: 'task-123',
 *   payload: { title: 'My Task' }
 * });
 */
export function dispatch(event: SyncEvent): SyncDispatchResult {
  try {
    const item = recordQueueItem({
      entity: event.entity,
      operation: event.operation,
      entityId: event.entityId,
      payload: event.payload,
    });

    return {
      success: true,
      queueItemId: item.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[SyncDispatcher] Failed to enqueue ${event.operation} for ${event.entity}:`,
      message,
    );

    return {
      success: false,
      error: `[SyncDispatcher] Enqueue failed: ${message}`,
    };
  }
}

// No other exports.
// All sync events must use: dispatch({ entity, operation, entityId, payload })
