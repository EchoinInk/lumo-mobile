/**
 * Storage Partition Helpers
 *
 * Generates ownership-safe storage keys to prevent data leakage between:
 * - Guest users
 * - Authenticated users
 * - Different authenticated accounts
 *
 * Storage key patterns:
 * - guest:{localOwnerId}:{entityName}
 * - user:{cloudOwnerId}:{entityName}
 * - guest:{localOwnerId}:syncQueue
 * - user:{cloudOwnerId}:syncQueue
 *
 * This ensures:
 * - Guest data never leaks into authenticated account data
 * - One authenticated user never sees another user's local cache
 * - Sync queues are isolated per account
 * - Migration operations can identify source vs target partitions
 */

import type { RepositoryContext } from "@/features/auth/types/auth.types";

// ── Partition Key Generation ─────────────────────────────────────────────────────

/**
 * Get the storage partition key for a given repository context.
 * This is the base prefix for all entity storage keys in that context.
 *
 * Examples:
 * - guest:abc123-def456
 * - user:xyz789-ghi012
 */
export function getStoragePartitionKey(context: RepositoryContext): string {
  return context.storagePartitionKey;
}

/**
 * Get the full storage key for a specific entity in a given context.
 *
 * Examples:
 * - guest:abc123-def456:tasks
 * - user:xyz789-ghi012:habits
 *
 * @param entityName - The name of the entity (e.g., "tasks", "habits")
 * @param context - The repository context providing ownership
 */
export function getEntityStorageKey(
  entityName: string,
  context: RepositoryContext,
): string {
  return `${context.storagePartitionKey}:${entityName}`;
}

/**
 * Get the storage key for the sync queue in a given context.
 *
 * Examples:
 * - guest:abc123-def456:syncQueue
 * - user:xyz789-ghi012:syncQueue
 *
 * @param context - The repository context providing ownership
 */
export function getSyncQueueStorageKey(context: RepositoryContext): string {
  return context.syncPartitionKey;
}

/**
 * Get the storage key for migration metadata in a given context.
 * Used during guest → account migration to track progress.
 *
 * Examples:
 * - guest:abc123-def456:migration
 * - user:xyz789-ghi012:migration
 *
 * @param context - The repository context providing ownership
 */
export function getMigrationStorageKey(context: RepositoryContext): string {
  return `${context.storagePartitionKey}:migration`;
}

// ── Partition Key Parsing ─────────────────────────────────────────────────────

/**
 * Parse a storage key to extract ownership information.
 * Useful for debugging and validation.
 *
 * Returns null if the key does not match the expected pattern.
 */
export function parseStorageKey(key: string): {
  mode: "guest" | "user";
  ownerId: string;
  entityName?: string;
} | null {
  const guestMatch = key.match(/^guest:([^:]+)(?::(.+))?$/);
  if (guestMatch) {
    return {
      mode: "guest",
      ownerId: guestMatch[1],
      entityName: guestMatch[2],
    };
  }

  const userMatch = key.match(/^user:([^:]+)(?::(.+))?$/);
  if (userMatch) {
    return {
      mode: "user",
      ownerId: userMatch[1],
      entityName: userMatch[2],
    };
  }

  return null;
}

/**
 * Check if a storage key belongs to a guest context.
 */
export function isGuestStorageKey(key: string): boolean {
  return key.startsWith("guest:");
}

/**
 * Check if a storage key belongs to an authenticated user context.
 */
export function isUserStorageKey(key: string): boolean {
  return key.startsWith("user:");
}

/**
 * Check if a storage key belongs to a specific owner.
 *
 * @param key - The storage key to check
 * @param ownerId - The owner ID to match against
 */
export function isOwnerStorageKey(key: string, ownerId: string): boolean {
  const parsed = parseStorageKey(key);
  return parsed?.ownerId === ownerId;
}

// ── Migration Utilities ───────────────────────────────────────────────────────

/**
 * Get the source partition key for a guest → account migration.
 *
 * @param localOwnerId - The guest's local owner ID
 */
export function getGuestSourcePartitionKey(localOwnerId: string): string {
  return `guest:${localOwnerId}`;
}

/**
 * Get the target partition key for a guest → account migration.
 *
 * @param cloudOwnerId - The authenticated user's cloud owner ID
 */
export function getAuthenticatedTargetPartitionKey(cloudOwnerId: string): string {
  return `user:${cloudOwnerId}`;
}

/**
 * Generate all storage keys that need to be migrated during guest → account migration.
 *
 * @param sourceLocalOwnerId - The guest's local owner ID
 * @param targetCloudOwnerId - The authenticated user's cloud owner ID
 * @param entityNames - List of entity names to migrate
 */
export function getMigrationKeyMap(
  sourceLocalOwnerId: string,
  targetCloudOwnerId: string,
  entityNames: string[],
): Record<string, string> {
  const sourcePrefix = getGuestSourcePartitionKey(sourceLocalOwnerId);
  const targetPrefix = getAuthenticatedTargetPartitionKey(targetCloudOwnerId);

  const keyMap: Record<string, string> = {};

  for (const entityName of entityNames) {
    const sourceKey = `${sourcePrefix}:${entityName}`;
    const targetKey = `${targetPrefix}:${entityName}`;
    keyMap[sourceKey] = targetKey;
  }

  // Also include sync queue
  const sourceSyncKey = `${sourcePrefix}:syncQueue`;
  const targetSyncKey = `${targetPrefix}:syncQueue`;
  keyMap[sourceSyncKey] = targetSyncKey;

  return keyMap;
}

// ── Validation ─────────────────────────────────────────────────────────────────

/**
 * Validate that a storage key follows the expected partition pattern.
 * Throws an error if the key is invalid.
 *
 * @param key - The storage key to validate
 */
export function validateStorageKey(key: string): void {
  const parsed = parseStorageKey(key);
  if (!parsed) {
    throw new Error(
      `[validateStorageKey] Invalid storage key format: ${key}. Expected pattern: guest:{localOwnerId}:{entityName} or user:{cloudOwnerId}:{entityName}`,
    );
  }

  if (!parsed.ownerId) {
    throw new Error(
      `[validateStorageKey] Storage key missing owner ID: ${key}`,
    );
  }
}

/**
 * Validate that a storage key belongs to the expected context.
 * Throws an error if the key does not match the context.
 *
 * @param key - The storage key to validate
 * @param context - The expected repository context
 */
export function validateStorageKeyForContext(
  key: string,
  context: RepositoryContext,
): void {
  const parsed = parseStorageKey(key);
  if (!parsed) {
    throw new Error(
      `[validateStorageKeyForContext] Invalid storage key format: ${key}`,
    );
  }

  const expectedMode = context.accountMode === "guest" ? "guest" : "user";
  if (parsed.mode !== expectedMode) {
    throw new Error(
      `[validateStorageKeyForContext] Storage key mode mismatch. Expected ${expectedMode}, got ${parsed.mode} for key: ${key}`,
    );
  }

  const expectedOwnerId = context.accountMode === "guest"
    ? context.localOwnerId
    : context.cloudOwnerId;

  if (parsed.ownerId !== expectedOwnerId) {
    throw new Error(
      `[validateStorageKeyForContext] Storage key owner mismatch. Expected ${expectedOwnerId}, got ${parsed.ownerId} for key: ${key}`,
    );
  }
}
