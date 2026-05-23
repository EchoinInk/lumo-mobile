/**
 * Idempotency Key Factory
 *
 * Generates a deterministic, content-addressed key for a sync operation.
 * Generated ONCE at queue item creation — never mutated.
 *
 * Properties:
 * - Deterministic: same inputs always produce same key
 * - Stable: key survives app restarts (based on content, not runtime state)
 * - Unique: timestamp component prevents collision for the same entity+op
 *
 * Used by:
 * - Queue deduplication layer (replay protection)
 * - Sync processor (skip-if-already-processed guard)
 * - Dead letter correlation
 */

/**
 * Create a stable idempotency key for a sync operation.
 *
 * Format: `${entityType}:${entityId}:${operation}:${timestamp}`
 *
 * @param entityType - Entity type (e.g. 'task', 'habit')
 * @param entityId   - Unique entity ID
 * @param operation  - CRUD operation ('create' | 'update' | 'delete')
 * @param timestamp  - Unix timestamp in ms (Date.now() at creation time)
 */
export function createIdempotencyKey(
  entityType: string,
  entityId: string,
  operation: string,
  timestamp: number,
): string {
  return [entityType, entityId, operation, timestamp].join(':');
}
