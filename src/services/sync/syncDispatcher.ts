/**
 * Sync Dispatcher
 *
 * Pure transport layer for sync events.
 *
 * Architecture:
 *   Event Builder → Dispatcher → Queue → MMKV
 *
 * Responsibility:
 * - Accept SyncEvent
 * - Forward to syncQueue
 * - Log errors (never throw)
 *
 * NO business logic.
 * NO entity-specific code.
 * ONLY transport.
 */

import { recordQueueItem } from "../storage/syncQueue";
import { SyncEvent } from "./syncEvent.types";

/**
 * Dispatch a sync event to the queue.
 *
 * SINGLE CANONICAL entry point for all sync operations.
 * Fire-and-forget: never blocks, never throws.
 *
 * @param event - The sync event to dispatch
 *
 * @example
 * dispatch(syncEvents.task.created(taskId, { title: 'My Task' }));
 */
export function dispatch(event: SyncEvent): void {
  try {
    recordQueueItem({
      entity: event.entity,
      operation: event.operation,
      entityId: event.entityId,
      payload: event.payload,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[SyncDispatcher] Failed to enqueue ${event.operation} for ${event.entity}:`,
      message,
    );
  }
}

// No other exports.
// All sync events must use: dispatch(event)
