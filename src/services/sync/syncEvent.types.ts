/**
 * Sync Event Types
 *
 * Canonical event structure for the unified sync pipeline.
 *
 * Architecture:
 *   UI → Store → Repository → Event Builder → Dispatcher → Queue
 *
 * Principle: Exactly ONE way to dispatch sync events.
 */

/** Supported entity types */
export type SyncEntity = "task" | "habit" | "meal" | "budget" | "workout";

/** Supported CRUD operations */
export type SyncOperation = "create" | "update" | "delete";

/**
 * Canonical sync event.
 * Single unified structure for all sync operations.
 */
export interface SyncEvent {
  /** Entity type being synced */
  entity: SyncEntity;

  /** CRUD operation type */
  operation: SyncOperation;

  /** ID of the entity */
  entityId: string;

  /** Operation payload (entity-specific data) */
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
