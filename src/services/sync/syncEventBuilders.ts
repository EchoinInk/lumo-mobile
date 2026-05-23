/**
 * Sync Event Builders
 *
 * Canonical factory for sync events.
 * The ONLY place where sync intent is created.
 *
 * Architecture:
 *   UI → Store → Repository → Event Builders → Dispatcher → Queue
 *
 * Principle: Exactly ONE way to create sync events.
 *
 * Usage:
 *   const event = syncEvents.task.created(taskId, { title: 'My Task' });
 *   dispatch(event);
 */

import { SyncEntity, SyncEvent, SyncOperation } from './syncEvent.types';

// ── Task Event Payloads ──────────────────────────────────────────────────────

export interface TaskCreatePayload {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  dueDate?: string;
}

export interface TaskUpdatePayload {
  title?: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  dueDate?: string;
  completed?: boolean;
}

export interface TaskDeletePayload {
  deletedAt: string;
}

// ── Task Event Builders ────────────────────────────────────────────────────

function createTaskEvent(
  operation: SyncOperation,
  entityId: string,
  payload?: unknown
): SyncEvent {
  return {
    entity: 'task',
    operation,
    entityId,
    payload,
  };
}

/**
 * Task sync event builders.
 * Use these to create task sync events.
 */
export const task = {
  /**
   * Create a 'task created' sync event.
   */
  created: (entityId: string, payload: TaskCreatePayload): SyncEvent =>
    createTaskEvent('create', entityId, payload),

  /**
   * Create a 'task updated' sync event.
   */
  updated: (entityId: string, payload: TaskUpdatePayload): SyncEvent =>
    createTaskEvent('update', entityId, payload),

  /**
   * Create a 'task deleted' sync event.
   */
  deleted: (entityId: string, deletedAt: string): SyncEvent =>
    createTaskEvent('delete', entityId, { deletedAt }),

  /**
   * Create a 'task toggled' (completion status changed) sync event.
   */
  toggled: (entityId: string, completed: boolean): SyncEvent =>
    createTaskEvent('update', entityId, { completed }),
} as const;

// ── Generic Event Builder ──────────────────────────────────────────────────

/**
 * Generic sync event builder.
 * Use for custom or non-standard sync events.
 *
 * @param entity - Entity type
 * @param operation - CRUD operation
 * @param entityId - Entity ID
 * @param payload - Optional payload
 * @returns SyncEvent
 */
export function createSyncEvent(
  entity: SyncEntity,
  operation: SyncOperation,
  entityId: string,
  payload?: unknown
): SyncEvent {
  return {
    entity,
    operation,
    entityId,
    payload,
  };
}

// ── Namespace Export ───────────────────────────────────────────────────────

/**
 * All sync event builders.
 * Import this to create sync events.
 *
 * @example
 * import { syncEvents } from '@/services/sync/syncEventBuilders';
 *
 * const event = syncEvents.task.created(taskId, { title: 'My Task' });
 * dispatch(event);
 */
export const syncEvents = {
  task,
  create: createSyncEvent,
} as const;

// Default export for convenience
export default syncEvents;
