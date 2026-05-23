/**
 * Queue Validation Layer
 *
 * Lightweight runtime validation for sync queue items.
 * Rejects malformed queue items before persistence.
 *
 * Responsibility:
 * - Validate queue item structure
 * - Enforce entity type constraints
 * - Enforce operation type constraints
 * - Protect against partial writes
 *
 * NON-GOALS:
 * - No schema validation library (zod/yup)
 * - No complex business logic validation
 * - Minimal and fast runtime checks only
 */

import type { SyncQueueItem, CreateQueueItemInput } from '../../storage/queue.types';

// ── Validation Errors ─────────────────────────────────────────────────────────

export class QueueValidationError extends Error {
  constructor(message: string) {
    super(`[QueueValidation] ${message}`);
    this.name = 'QueueValidationError';
  }
}

// ── Type Validation ──────────────────────────────────────────────────────────

const VALID_ENTITIES = ['task', 'habit', 'meal', 'budget', 'workout'] as const;
const VALID_OPERATIONS = ['create', 'update', 'delete'] as const;
const VALID_STATUSES = ['pending', 'failed', 'completed'] as const;

/**
 * Check if entity type is valid.
 */
export function isValidEntityType(entity: string): entity is typeof VALID_ENTITIES[number] {
  return VALID_ENTITIES.includes(entity as any);
}

/**
 * Check if operation type is valid.
 */
export function isValidOperation(operation: string): operation is typeof VALID_OPERATIONS[number] {
  return VALID_OPERATIONS.includes(operation as any);
}

/**
 * Check if status is valid.
 */
export function isValidStatus(status: string): status is typeof VALID_STATUSES[number] {
  return VALID_STATUSES.includes(status as any);
}

// ── Item Validation ──────────────────────────────────────────────────────────

/**
 * Validate a queue item input.
 * Throws QueueValidationError if invalid.
 */
export function validateQueueItemInput(input: CreateQueueItemInput): void {
  // Validate entity type
  if (!input.entity || typeof input.entity !== 'string') {
    throw new QueueValidationError('Entity type is required and must be a string');
  }
  
  if (!isValidEntityType(input.entity)) {
    throw new QueueValidationError(
      `Invalid entity type: ${input.entity}. Must be one of: ${VALID_ENTITIES.join(', ')}`
    );
  }

  // Validate operation type
  if (!input.operation || typeof input.operation !== 'string') {
    throw new QueueValidationError('Operation type is required and must be a string');
  }
  
  if (!isValidOperation(input.operation)) {
    throw new QueueValidationError(
      `Invalid operation type: ${input.operation}. Must be one of: ${VALID_OPERATIONS.join(', ')}`
    );
  }

  // Validate entity ID
  if (!input.entityId || typeof input.entityId !== 'string') {
    throw new QueueValidationError('Entity ID is required and must be a string');
  }

  // Validate payload (optional)
  if (input.payload !== undefined && typeof input.payload !== 'object') {
    throw new QueueValidationError('Payload must be an object if provided');
  }
}

/**
 * Validate a complete queue item.
 * Throws QueueValidationError if invalid.
 */
export function validateQueueItem(item: SyncQueueItem): void {
  // Validate required string fields
  if (!item.id || typeof item.id !== 'string') {
    throw new QueueValidationError('Item ID is required and must be a string');
  }

  if (!item.timestamp || typeof item.timestamp !== 'string') {
    throw new QueueValidationError('Timestamp is required and must be an ISO string');
  }

  // Validate timestamp format
  if (isNaN(Date.parse(item.timestamp))) {
    throw new QueueValidationError('Timestamp must be a valid ISO date string');
  }

  // Validate entity and operation
  validateQueueItemInput({
    entity: item.entity,
    operation: item.operation,
    entityId: item.entityId,
    payload: item.payload,
  });

  // Validate status
  if (!item.status || typeof item.status !== 'string') {
    throw new QueueValidationError('Status is required and must be a string');
  }
  
  if (!isValidStatus(item.status)) {
    throw new QueueValidationError(
      `Invalid status: ${item.status}. Must be one of: ${VALID_STATUSES.join(', ')}`
    );
  }

  // Validate retry count
  if (typeof item.retryCount !== 'number' || item.retryCount < 0) {
    throw new QueueValidationError('Retry count must be a non-negative number');
  }

  // Validate error (optional)
  if (item.error !== undefined && item.error !== null && typeof item.error !== 'string') {
    throw new QueueValidationError('Error must be a string if provided');
  }
}

/**
 * Check if an item is corrupted (missing required fields).
 * Returns true if corrupted, false otherwise.
 */
export function isCorruptedItem(item: unknown): boolean {
  if (!item || typeof item !== 'object') {
    return true;
  }

  const obj = item as Record<string, unknown>;
  const required = ['id', 'entity', 'operation', 'entityId', 'timestamp', 'status', 'retryCount'];

  for (const field of required) {
    if (obj[field] === undefined || obj[field] === null) {
      return true;
    }
  }

  return false;
}

/**
 * Safe validation wrapper.
 * Returns validation result instead of throwing.
 */
export function safeValidateQueueItem(item: SyncQueueItem): {
  valid: boolean;
  error?: string;
} {
  try {
    validateQueueItem(item);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
