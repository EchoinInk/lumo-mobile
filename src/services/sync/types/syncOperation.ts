/**
 * Sync Operation Envelope
 *
 * The canonical, fully-typed payload passed from the sync processor
 * to a backend adapter. Contains everything the adapter needs —
 * no additional context lookups required.
 *
 * Rules:
 * - All fields are stamped at queue item creation time
 * - userId is NEVER inferred at sync time — read from the item
 * - idempotencyKey is used by adapters to detect duplicate writes
 * - Adapters MUST pass idempotencyKey to the backend (e.g. as a header or field)
 */

/**
 * Fully-typed sync operation envelope.
 *
 * @template T - Payload shape for the specific entity type
 */
export interface SyncOperationEnvelope<T = unknown> {
  /** Queue item ID (for status updates after sync attempt) */
  queueId: string;

  /**
   * Owner of this operation.
   * Stamped at creation time — never inferred from session at sync time.
   * Null in anonymous/local-first mode.
   */
  userId: string | null;

  /** Entity type (e.g. 'task', 'habit') */
  entityType: string;

  /** Unique entity ID */
  entityId: string;

  /** CRUD operation */
  operation: 'create' | 'update' | 'delete';

  /** Operation payload (entity snapshot or partial update) */
  payload: T;

  /**
   * Idempotency key — derived from entityType:entityId:operation:timestamp.
   * Adapters should use this to detect and skip duplicate backend writes.
   */
  idempotencyKey: string;

  /** Unix timestamp (ms) when this operation was originally enqueued */
  createdAt: number;
}
