/**
 * Sync Event Types
 *
 * Standardized event structure for sync operations.
 * Used by Sync Dispatcher to create consistent queue entries.
 *
 * Architecture:
 *   UI → Store → Repository → Sync Dispatcher → Sync Queue
 */

export type SyncEntityType = 'task' | 'habit' | 'meal' | 'budget' | 'workout';

export type SyncOperationType = 'create' | 'update' | 'delete';

/**
 * Base sync event structure.
 * All entity-specific events extend this.
 */
export interface SyncEvent {
  /** Entity type being synced */
  entity: SyncEntityType;

  /** CRUD operation type */
  operation: SyncOperationType;

  /** ID of the entity */
  entityId: string;

  /** Operation payload (entity-specific data) */
  payload?: unknown;
}

/**
 * Task-specific sync event.
 */
export interface TaskSyncEvent extends SyncEvent {
  entity: 'task';
  payload?: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    completed?: boolean;
    dueDate?: string;
    deletedAt?: string;
  };
}

/**
 * Factory input for creating sync events.
 * Used by repositories/store to request sync recording.
 */
export interface CreateSyncEventInput {
  entity: SyncEntityType;
  operation: SyncOperationType;
  entityId: string;
  payload?: unknown;
}

/**
 * Result of dispatching a sync event.
 */
export interface SyncDispatchResult {
  success: boolean;
  queueItemId?: string;
  error?: string;
}
