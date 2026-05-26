/**
 * Sync Queue Types
 *
 * Strongly typed queue item model for local-first sync architecture.
 * Queue entries persist in MMKV and are processed when online.
 *
 * Architecture:
 *   UI → Zustand → Repository → MMKV → Sync Queue
 *
 * Ownership:
 * - Each queue item carries ownership metadata at creation time
 * - Guest sync items are never sent to Supabase
 * - Authenticated sync items may be sent to Supabase
 * - Migration sync items are identifiable for data transfer
 */

export type SyncEntity = "task" | "habit" | "meal" | "budget" | "workout";

export type SyncOperation = "create" | "update" | "delete";

/**
 * Owner type for sync queue items.
 * - guest: Item created while in guest mode (local-only, never synced to cloud)
 * - authenticated: Item created while authenticated (may be synced to cloud)
 */
export type SyncOwnerType = "guest" | "authenticated";

/**
 * Canonical queue item states.
 * - pending: Item created, waiting to be processed
 * - processing: Item is currently being processed (has lock)
 * - synced: Item successfully synced to backend (replaces 'completed' for audit trail)
 * - failed: Item failed processing, may retry
 * - conflict: Item has a server-side conflict requiring resolution
 * - dead_letter: Item failed after max retries, no further attempts
 * - completed: Item successfully processed, will be removed (kept for compatibility)
 */
export type QueueItemStatus =
  | "pending"
  | "processing"
  | "synced"
  | "failed"
  | "conflict"
  | "dead_letter"
  | "completed";

/**
 * Mutable queue item for storage layer.
 * Allows state transitions during processing.
 */
export interface SyncQueueItem {
  /** Unique queue entry ID */
  id: string;

  /**
   * Owner type for this queue item.
   * Stamped at creation time. Never inferred at sync time.
   * - guest: Item created in guest mode (local-only)
   * - authenticated: Item created while authenticated (may sync to cloud)
   */
  ownerType: SyncOwnerType;

  /**
   * Local owner ID for this queue item.
   * Always present - provides stable identity for guest and authenticated modes.
   */
  localOwnerId: string;

  /**
   * Cloud owner ID for this queue item.
   * Present only when ownerType is "authenticated".
   * Used to identify which authenticated account owns this item.
   */
  cloudOwnerId?: string;

  /**
   * Sync partition key for this queue item.
   * Identifies which sync queue partition this item belongs to.
   * Format: guest:{localOwnerId}:syncQueue or user:{cloudOwnerId}:syncQueue
   */
  syncPartitionKey: string;

  /**
   * Whether this item was created during guest → account migration.
   * Used to identify items that need special handling during migration.
   */
  createdDuringMigration?: boolean;

  /** Entity type being synced */
  entity: SyncEntity;

  /** CRUD operation type */
  operation: SyncOperation;

  /** ID of the entity being operated on */
  entityId: string;

  /** ISO timestamp when entry was created */
  timestamp: string;

  /** Operation payload (entity-specific) */
  payload?: unknown;

  /** Number of retry attempts */
  retryCount: number;

  /** Current processing status */
  status: QueueItemStatus;

  /** Error message from last failed attempt */
  error?: string | null;

  /**
   * Idempotency key — generated ONCE at creation, never changes.
   * Used for replay-safe deduplication across restarts.
   * Format: entityType:entityId:operation:timestamp
   */
  idempotencyKey: string;

  /** Unix timestamp of last processing attempt (null if never attempted) */
  lastAttemptAt: number | null;

  /** Unix timestamp when successfully synced to backend (null until synced) */
  syncedAt: number | null;
}

/**
 * Base queue item fields (common to all states).
 */
interface BaseQueueItem {
  /** Unique queue entry ID */
  readonly id: string;

  /** Owner type — stamped at creation time */
  readonly ownerType: SyncOwnerType;

  /** Local owner ID — always present */
  readonly localOwnerId: string;

  /** Cloud owner ID — present only for authenticated items */
  readonly cloudOwnerId?: string;

  /** Sync partition key */
  readonly syncPartitionKey: string;

  /** Whether created during migration */
  readonly createdDuringMigration?: boolean;

  /** Entity type being synced */
  readonly entity: SyncEntity;

  /** CRUD operation type */
  readonly operation: SyncOperation;

  /** ID of the entity being operated on */
  readonly entityId: string;

  /** ISO timestamp when entry was created */
  readonly timestamp: string;

  /** Operation payload (entity-specific) */
  readonly payload?: unknown;

  /** Idempotency key — immutable after creation */
  readonly idempotencyKey: string;

  /** Unix timestamp of last processing attempt */
  readonly lastAttemptAt: number | null;

  /** Unix timestamp of successful backend sync */
  readonly syncedAt: number | null;
}

/**
 * Pending queue item - waiting to be processed.
 */
export interface PendingQueueItem extends BaseQueueItem {
  readonly status: "pending";
  readonly retryCount: 0;
  readonly error: null;
}

/**
 * Processing queue item - currently being processed.
 */
export interface ProcessingQueueItem extends BaseQueueItem {
  readonly status: "processing";
  readonly retryCount: number;
  readonly error: null;
}

/**
 * Failed queue item - failed processing, may retry.
 */
export interface FailedQueueItem extends BaseQueueItem {
  readonly status: "failed";
  readonly retryCount: number;
  readonly error: string;
}

/**
 * Dead letter queue item - failed after max retries, no further attempts.
 */
export interface DeadLetterQueueItem extends BaseQueueItem {
  readonly status: "dead_letter";
  readonly retryCount: number;
  readonly error: string;
}

/**
 * Completed queue item - successfully processed, will be removed.
 */
export interface CompletedQueueItem extends BaseQueueItem {
  readonly status: "completed";
  readonly retryCount: number;
  readonly error: null;
}

/**
 * Discriminated union of all queue item states for type guards.
 * Used for validation and lifecycle checks, not storage.
 */
export type StrictQueueItem =
  | PendingQueueItem
  | ProcessingQueueItem
  | FailedQueueItem
  | DeadLetterQueueItem
  | CompletedQueueItem;

/**
 * Input for creating a new queue item.
 * ID and timestamp are generated automatically.
 */
export interface CreateQueueItemInput {
  /**
   * Owner of this operation.
   * Pass the authenticated userId, or null for anonymous/local-first mode.
   */
  userId?: string | null;
  entity: SyncEntity;
  operation: SyncOperation;
  entityId: string;
  payload?: unknown;
}

/**
 * Result of a queue operation.
 */
export interface QueueOperationResult {
  success: boolean;
  item?: SyncQueueItem;
  error?: string;
}

/** Maximum retry attempts before marking as failed */
export const MAX_RETRY_COUNT = 5;

/** Storage key for queue persistence */
export const SYNC_QUEUE_STORAGE_KEY = "sync_queue_v1";
