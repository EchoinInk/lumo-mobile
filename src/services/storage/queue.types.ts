/**
 * Sync Queue Types
 *
 * Strongly typed queue item model for local-first sync architecture.
 * Queue entries persist in MMKV and are processed when online.
 *
 * Architecture:
 *   UI → Zustand → Repository → MMKV → Sync Queue
 */

export type SyncEntity = "task" | "habit" | "meal" | "budget" | "workout";

export type SyncOperation = "create" | "update" | "delete";

/**
 * Canonical queue item states.
 * - pending: Item created, waiting to be processed
 * - processing: Item is currently being processed (has lock)
 * - failed: Item failed processing, may retry
 * - dead_letter: Item failed after max retries, no further attempts
 * - completed: Item successfully processed, will be removed
 */
export type QueueItemStatus =
  | "pending"
  | "processing"
  | "failed"
  | "dead_letter"
  | "completed";

/**
 * Mutable queue item for storage layer.
 * Allows state transitions during processing.
 */
export interface SyncQueueItem {
  /** Unique queue entry ID */
  id: string;

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
}

/**
 * Base queue item fields (common to all states).
 */
interface BaseQueueItem {
  /** Unique queue entry ID */
  readonly id: string;

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
