/**
 * Sync Types
 *
 * Shared types for sync system operations.
 */

import type { SyncEntity, SyncOperation } from '../../storage/queue.types';

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
}
