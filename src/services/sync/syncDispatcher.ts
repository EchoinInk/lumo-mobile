/**
 * Sync Dispatcher
 *
 * Centralized layer for creating sync events and enqueueing them.
 * Decouples repositories from sync queue implementation.
 *
 * Architecture:
 *   UI → Store → Repository → Sync Dispatcher → Sync Queue → MMKV
 *
 * Responsibilities:
 * - Create standardized sync events
 * - Normalize event structure across entities
 * - Handle enqueue failures gracefully
 * - Provide type-safe dispatch methods
 *
 * This phase: local-only event creation
 * Future phase: Supabase integration
 */

import { recordQueueItem } from '../storage/syncQueue';
import {
  CreateSyncEventInput,
  SyncDispatchResult,
  SyncEntityType,
  SyncOperationType,
  TaskSyncEvent,
} from './syncEvent.types';

// ── Private helpers ────────────────────────────────────────────────────────

/**
 * Normalize and enqueue a sync event.
 * All errors are caught and normalized.
 */
function enqueueEvent(
  entity: SyncEntityType,
  operation: SyncOperationType,
  entityId: string,
  payload?: unknown
): SyncDispatchResult {
  try {
    const item = recordQueueItem({
      entity,
      operation,
      entityId,
      payload,
    });

    return {
      success: true,
      queueItemId: item.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[SyncDispatcher] Failed to enqueue ${operation} for ${entity}:`, message);

    return {
      success: false,
      error: `[SyncDispatcher] Enqueue failed: ${message}`,
    };
  }
}

// ── Generic Dispatch ─────────────────────────────────────────────────────

/**
 * Dispatch a sync event for any entity.
 * Generic low-level dispatch method.
 *
 * @param input - Sync event creation input
 * @returns Dispatch result with queue item ID or error
 *
 * @example
 * const result = dispatchSyncEvent({
 *   entity: 'task',
 *   operation: 'create',
 *   entityId: task.id,
 *   payload: { title: task.title }
 * });
 */
export function dispatchSyncEvent(input: CreateSyncEventInput): SyncDispatchResult {
  return enqueueEvent(input.entity, input.operation, input.entityId, input.payload);
}

// ── Task-Specific Dispatchers ────────────────────────────────────────────

/**
 * Dispatch task creation sync event.
 *
 * @param taskId - ID of the created task
 * @param payload - Task creation data
 * @returns Dispatch result
 */
export function dispatchTaskCreated(
  taskId: string,
  payload: TaskSyncEvent['payload']
): SyncDispatchResult {
  return enqueueEvent('task', 'create', taskId, payload);
}

/**
 * Dispatch task update sync event.
 *
 * @param taskId - ID of the updated task
 * @param payload - Task update data
 * @returns Dispatch result
 */
export function dispatchTaskUpdated(
  taskId: string,
  payload: TaskSyncEvent['payload']
): SyncDispatchResult {
  return enqueueEvent('task', 'update', taskId, payload);
}

/**
 * Dispatch task deletion sync event.
 *
 * @param taskId - ID of the deleted task
 * @param deletedAt - ISO timestamp of deletion
 * @returns Dispatch result
 */
export function dispatchTaskDeleted(
  taskId: string,
  deletedAt: string
): SyncDispatchResult {
  return enqueueEvent('task', 'delete', taskId, { deletedAt });
}

/**
 * Dispatch task toggle (completion) sync event.
 *
 * @param taskId - ID of the toggled task
 * @param completed - New completion status
 * @returns Dispatch result
 */
export function dispatchTaskToggled(
  taskId: string,
  completed: boolean
): SyncDispatchResult {
  return enqueueEvent('task', 'update', taskId, { completed });
}

// ── Batch Operations ─────────────────────────────────────────────────────

/**
 * Dispatch multiple sync events.
 * Continues on individual failures, reports aggregate result.
 *
 * @param events - Array of sync events to dispatch
 * @returns Aggregate result with success count and failures
 */
export function dispatchBatchSyncEvents(
  events: CreateSyncEventInput[]
): { successCount: number; failures: Array<{ index: number; error: string }> } {
  const failures: Array<{ index: number; error: string }> = [];
  let successCount = 0;

  for (let i = 0; i < events.length; i++) {
    const result = dispatchSyncEvent(events[i]);
    if (result.success) {
      successCount++;
    } else {
      failures.push({ index: i, error: result.error ?? 'Unknown error' });
    }
  }

  return { successCount, failures };
}

// ── Future Entity Placeholders ───────────────────────────────────────────

// Habits, meals, budget, workouts will follow same pattern:
// export function dispatchHabitCreated(habitId: string, payload: unknown): SyncDispatchResult
// export function dispatchMealCreated(mealId: string, payload: unknown): SyncDispatchResult
// etc.
