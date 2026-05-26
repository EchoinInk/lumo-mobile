/**
 * Sync Ownership Enforcement
 *
 * Enforces ownership rules for sync queue operations.
 * Ensures guest-owned sync items never upload and authenticated items respect ownership.
 *
 * Rules:
 * - Guest-owned sync items must never upload
 * - Authenticated sync items may upload later
 * - Sync dispatcher must validate ownership
 * - Sync queue must reject invalid ownership states
 * - Migration-state sync items must pause safely
 */

import type { SyncQueueItem, SyncOwnerType } from "@/services/storage/queue.types";
import type { RepositoryContext } from "@/features/auth/types/auth.types";

// ── Ownership Validation ─────────────────────────────────────────────────────────

/**
 * Validate that a sync queue item has valid ownership metadata.
 *
 * @param item - Sync queue item to validate
 * @returns True if ownership is valid
 */
export function validateSyncOwnership(item: SyncQueueItem): boolean {
  // Must have ownerType
  if (!item.ownerType || (item.ownerType !== "guest" && item.ownerType !== "authenticated")) {
    console.error("[SyncOwnership] Invalid ownerType:", item.ownerType);
    return false;
  }

  // Must have localOwnerId
  if (!item.localOwnerId || item.localOwnerId.length === 0) {
    console.error("[SyncOwnership] Missing localOwnerId");
    return false;
  }

  // Authenticated items must have cloudOwnerId
  if (item.ownerType === "authenticated" && !item.cloudOwnerId) {
    console.error("[SyncOwnership] Missing cloudOwnerId for authenticated item");
    return false;
  }

  // Must have syncPartitionKey
  if (!item.syncPartitionKey || item.syncPartitionKey.length === 0) {
    console.error("[SyncOwnership] Missing syncPartitionKey");
    return false;
  }

  // Sync partition key must match ownership pattern
  const expectedPrefix = item.ownerType === "guest" ? "guest:" : "user:";
  if (!item.syncPartitionKey.startsWith(expectedPrefix)) {
    console.error(
      "[SyncOwnership] Sync partition key mismatch:",
      item.syncPartitionKey,
      "expected prefix:",
      expectedPrefix,
    );
    return false;
  }

  return true;
}

/**
 * Assert that a sync queue item has valid ownership.
 * Throws an error if ownership is invalid.
 *
 * @param item - Sync queue item to validate
 * @throws Error if ownership is invalid
 */
export function assertSyncOwnership(item: SyncQueueItem): void {
  if (!validateSyncOwnership(item)) {
    throw new Error(
      `[SyncOwnership] Invalid ownership for sync item ${item.id}: ownerType=${item.ownerType}, localOwnerId=${item.localOwnerId}`,
    );
  }
}

// ── Ownership Matching ───────────────────────────────────────────────────────────

/**
 * Check if a sync queue item belongs to a given repository context.
 *
 * @param item - Sync queue item
 * @param context - Repository context
 * @returns True if item belongs to context
 */
export function syncItemBelongsToContext(
  item: SyncQueueItem,
  context: RepositoryContext,
): boolean {
  // Owner type must match
  if (item.ownerType !== context.accountMode) {
    return false;
  }

  // Local owner ID must match
  if (item.localOwnerId !== context.localOwnerId) {
    return false;
  }

  // For authenticated items, cloud owner ID must match
  if (context.accountMode === "authenticated") {
    if (item.cloudOwnerId !== context.cloudOwnerId) {
      return false;
    }
  }

  // Sync partition key must match
  if (item.syncPartitionKey !== context.syncPartitionKey) {
    return false;
  }

  return true;
}

/**
 * Filter sync queue items to only those belonging to a given context.
 *
 * @param items - Sync queue items
 * @param context - Repository context
 * @returns Filtered items
 */
export function filterSyncItemsByContext(
  items: SyncQueueItem[],
  context: RepositoryContext,
): SyncQueueItem[] {
  return items.filter((item) => syncItemBelongsToContext(item, context));
}

// ── Upload Eligibility ─────────────────────────────────────────────────────────

/**
 * Check if a sync queue item is eligible for upload.
 * Guest-owned items are never eligible for upload.
 *
 * @param item - Sync queue item
 * @returns True if item can be uploaded
 */
export function isSyncItemEligibleForUpload(item: SyncQueueItem): boolean {
  // Guest items never upload
  if (item.ownerType === "guest") {
    return false;
  }

  // Items created during migration should pause
  if (item.createdDuringMigration) {
    return false;
  }

  // Only authenticated items can upload
  return item.ownerType === "authenticated";
}

/**
 * Filter sync queue items to only those eligible for upload.
 *
 * @param items - Sync queue items
 * @returns Upload-eligible items
 */
export function filterUploadEligibleItems(items: SyncQueueItem[]): SyncQueueItem[] {
  return items.filter(isSyncItemEligibleForUpload);
}

// ── Migration Safety ───────────────────────────────────────────────────────────

/**
 * Check if a sync queue item was created during migration.
 *
 * @param item - Sync queue item
 * @returns True if item was created during migration
 */
export function isSyncItemCreatedDuringMigration(item: SyncQueueItem): boolean {
  return item.createdDuringMigration === true;
}

/**
 * Filter sync queue items to only those created during migration.
 *
 * @param items - Sync queue items
 * @returns Migration-created items
 */
export function filterMigrationCreatedItems(items: SyncQueueItem[]): SyncQueueItem[] {
  return items.filter(isSyncItemCreatedDuringMigration);
}

/**
 * Filter sync queue items to exclude those created during migration.
 *
 * @param items - Sync queue items
 * @returns Non-migration items
 */
export function filterNonMigrationItems(items: SyncQueueItem[]): SyncQueueItem[] {
  return items.filter((item) => !isSyncItemCreatedDuringMigration(item));
}

// ── Ownership Assertions ───────────────────────────────────────────────────────

/**
 * Assert that a sync queue item is guest-owned.
 *
 * @param item - Sync queue item
 * @throws Error if item is not guest-owned
 */
export function assertGuestOwned(item: SyncQueueItem): void {
  if (item.ownerType !== "guest") {
    throw new Error(
      `[SyncOwnership] Expected guest-owned item, got ${item.ownerType}`,
    );
  }
}

/**
 * Assert that a sync queue item is authenticated-owned.
 *
 * @param item - Sync queue item
 * @throws Error if item is not authenticated-owned
 */
export function assertAuthenticatedOwned(item: SyncQueueItem): void {
  if (item.ownerType !== "authenticated") {
    throw new Error(
      `[SyncOwnership] Expected authenticated-owned item, got ${item.ownerType}`,
    );
  }
}

/**
 * Assert that a sync queue item is not eligible for upload.
 * Used to prevent guest items from being uploaded.
 *
 * @param item - Sync queue item
 * @throws Error if item is eligible for upload
 */
export function assertNotUploadEligible(item: SyncQueueItem): void {
  if (isSyncItemEligibleForUpload(item)) {
    throw new Error(
      `[SyncOwnership] Item ${item.id} is upload-eligible but should not be`,
    );
  }
}

// ── Ownership Metadata ─────────────────────────────────────────────────────────

/**
 * Get ownership metadata from a sync queue item for debugging.
 *
 * @param item - Sync queue item
 * @returns Ownership metadata description
 */
export function describeSyncOwnership(item: SyncQueueItem): string {
  const owner = item.ownerType === "guest"
    ? `guest:${item.localOwnerId.slice(0, 8)}`
    : `user:${item.cloudOwnerId?.slice(0, 8)}`;
  const migration = item.createdDuringMigration ? " (migration)" : "";
  return `${owner}${migration}`;
}
