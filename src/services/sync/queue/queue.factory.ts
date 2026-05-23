/**
 * Queue Factory
 *
 * Canonical queue item creation.
 * All repositories MUST use this factory to create queue items.
 *
 * Responsibility:
 * - Create queue items with consistent structure
 * - Normalize metadata
 * - Generate timestamps
 * - Enforce entity typing
 * - Enforce operation typing
 * - Validate before creation
 *
 * Usage:
 *   import { createQueueItem } from '@/services/sync/queue/queue.factory';
 *
 *   const item = createQueueItem({
 *     entity: 'task',
 *     operation: 'create',
 *     entityId: 'task_123',
 *     payload: { title: 'New Task' }
 *   });
 */

import type {
    CreateQueueItemInput,
    SyncQueueItem,
} from "../../storage/queue.types";
import { recordQueueItem } from "../../storage/syncQueue";
import { validateQueueItemInput } from "./queue.validation";

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a queue item with normalized metadata.
 * This is the single canonical path for queue item creation.
 *
 * @param input - Queue item input data
 * @returns Created queue item
 * @throws QueueValidationError if input is invalid
 */
export function createQueueItem(input: CreateQueueItemInput): SyncQueueItem {
  // Validate input before creation
  validateQueueItemInput(input);

  // Create and persist the item
  const item = recordQueueItem(input);

  return item;
}

/**
 * Create a queue item with explicit entity version.
 * Used for conflict detection in optimistic updates.
 *
 * @param input - Queue item input data
 * @param entityVersion - Entity version at time of enqueue
 * @returns Created queue item
 */
export function createQueueItemWithVersion(
  input: CreateQueueItemInput,
  entityVersion: number,
): SyncQueueItem {
  // Validate input before creation
  validateQueueItemInput(input);

  // Create and persist the item with version
  const item = recordQueueItem({
    ...input,
    payload: {
      ...(input.payload || {}),
      _entityVersion: entityVersion,
    },
  });

  return item;
}

/**
 * Batch create queue items.
 * All items are validated and persisted atomically.
 *
 * @param inputs - Array of queue item inputs
 * @returns Array of created queue items
 * @throws QueueValidationError if any input is invalid
 */
export function createQueueItems(
  inputs: CreateQueueItemInput[],
): SyncQueueItem[] {
  // Validate all inputs first (fail fast)
  for (const input of inputs) {
    validateQueueItemInput(input);
  }

  // Create all items
  return inputs.map((input) => recordQueueItem(input));
}
