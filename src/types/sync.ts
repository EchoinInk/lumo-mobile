/**
 * Sync Architecture Types
 *
 * Defines the contract for offline-first sync operations.
 * Queue entries persist in MMKV and process when online.
 */

/**
 * Sync metadata mixin for any syncable entity.
 * Add to domain types via intersection: `Task & Syncable`
 * or extend the interface directly.
 *
 * - `version` increments on every local mutation (conflict detection)
 * - `lastSyncedAt` tracks when this entity was last confirmed synced
 * - `pendingSync` is true when local state is ahead of remote
 */
export interface SyncableMetadata {
  /** Monotonically increasing version — bumped on every local write */
  version: number;
  /** ISO timestamp of last successful sync for this entity */
  lastSyncedAt?: string;
  /** True when the entity has unsynced local changes */
  pendingSync?: boolean;
}

export type SyncOperationType = 'create' | 'update' | 'delete';

export type SyncEntityType = 'task' | 'habit' | 'meal' | 'budget';

export type SyncStatus = 'pending' | 'processing' | 'failed' | 'completed';

export interface SyncQueueEntry {
  /** Unique operation ID */
  id: string;
  /** The domain entity type */
  entityType: SyncEntityType;
  /** CRUD operation type */
  operationType: SyncOperationType;
  /** The entity ID being operated on */
  entityId: string;
  /** Serialized payload for the operation */
  payload: Record<string, unknown>;
  /** Entity version at time of enqueue — used for conflict detection */
  entityVersion?: number;
  /** ISO timestamp when the operation was enqueued */
  createdAt: string;
  /** Number of times this operation has been retried */
  retryCount: number;
  /** Current sync status */
  status: SyncStatus;
  /** Error message from last failed attempt */
  lastError?: string;
  /** ISO timestamp of last attempt */
  lastAttemptAt?: string;
}

export interface SyncQueueState {
  /** All queued operations */
  entries: SyncQueueEntry[];
  /** Whether the sync processor is currently running */
  isProcessing: boolean;
  /** Timestamp of last successful sync */
  lastSyncAt: string | null;
}

export interface SyncResult {
  success: boolean;
  entryId: string;
  error?: string;
}

/** Maximum retry attempts before marking as failed */
export const MAX_SYNC_RETRIES = 5;

/** Base delay in ms for exponential backoff */
export const SYNC_RETRY_BASE_DELAY = 1000;
