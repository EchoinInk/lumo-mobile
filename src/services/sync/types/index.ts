/**
 * Sync Types
 *
 * Shared types for sync system operations.
 */

import type { SyncEntity, SyncOperation } from "../../storage/queue.types";

/**
 * Sync Event
 *
 * Event format for sync operations.
 * Used by the processor and adapters.
 */
export interface SyncEvent {
  /** Entity type being synced */
  entity: SyncEntity;
  /** CRUD operation type */
  operation: SyncOperation;
  /** ID of the entity being operated on */
  entityId: string;
  /** Operation payload (entity-specific) */
  payload?: unknown;
  /**
   * Idempotency key from the originating queue item.
   * Adapters should use this to prevent duplicate backend writes.
   * Optional for backward compat with legacy events.
   */
  idempotencyKey?: string;
}

// Re-export queue lifecycle types and functions
export * from "./queueLifecycle";
