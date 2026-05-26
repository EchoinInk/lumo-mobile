/**
 * Storage Isolation Reset Utilities
 *
 * Auth-aware storage isolation reset utilities for safe logout and account switching.
 * Ensures logout does not corrupt guest mode and authenticated logout isolates cloud-owned cache.
 *
 * Rules:
 * - Logout must not corrupt guest mode
 * - Authenticated logout must isolate cloud-owned cache
 * - Guest-owned data must remain recoverable
 * - Future multi-account support should remain possible
 * - Do not fully wipe all app data automatically
 */

import { createPersistStorage } from "@/store/createPersistStorage";
import type { LocalOwnerId, CloudOwnerId } from "@/features/auth/types/auth.types";

const storage = createPersistStorage();

// ── Storage Key Patterns ─────────────────────────────────────────────────────────

/**
 * Get storage key for authenticated partition.
 */
function getAuthenticatedPartitionKey(cloudOwnerId: CloudOwnerId, entity: string): string {
  return `user:${cloudOwnerId}:${entity}`;
}

/**
 * Get storage key for guest partition.
 */
function getGuestPartitionKey(localOwnerId: LocalOwnerId, entity: string): string {
  return `guest:${localOwnerId}:${entity}`;
}

/**
 * Get storage key for sync queue.
 */
function getSyncQueueKey(ownerId: string, isGuest: boolean): string {
  return isGuest ? `guest:${ownerId}:syncQueue` : `user:${ownerId}:syncQueue`;
}

// ── Authenticated Partition Clearing ───────────────────────────────────────────────

/**
 * Clear all authenticated partitions for a specific cloud owner.
 * Used during logout to isolate cloud-owned cache.
 *
 * @param cloudOwnerId - Cloud owner ID
 * @returns Promise resolving when clearing is complete
 */
export async function clearAuthenticatedPartitions(cloudOwnerId: CloudOwnerId): Promise<void> {
  console.log(`[StorageIsolation] Clearing authenticated partitions for ${cloudOwnerId}`);

  const entities = ["tasks", "habits", "settings", "preferences"];
  const keysToDelete: string[] = [];

  for (const entity of entities) {
    keysToDelete.push(getAuthenticatedPartitionKey(cloudOwnerId, entity));
  }

  // Delete sync queue
  keysToDelete.push(getSyncQueueKey(cloudOwnerId, false));

  // Perform deletion
  for (const key of keysToDelete) {
    try {
      await storage.delete(key);
    } catch (err) {
      console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
    }
  }

  console.log(`[StorageIsolation] Cleared ${keysToDelete.length} authenticated partitions`);
}

/**
 * Clear all authenticated partitions across all cloud owners.
 * Used for testing or full reset (use with caution).
 *
 * @returns Promise resolving when clearing is complete
 */
export async function clearAllAuthenticatedPartitions(): Promise<void {
  console.log("[StorageIsolation] Clearing all authenticated partitions");

  // Get all keys
  const allKeys = await storage.getAllKeys();
  const authenticatedKeys = allKeys.filter((key) => key.startsWith("user:"));

  // Delete all authenticated keys
  for (const key of authenticatedKeys) {
    try {
      await storage.delete(key);
    } catch (err) {
      console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
    }
  }

  console.log(`[StorageIsolation] Cleared ${authenticatedKeys.length} authenticated partitions`);
}

// ── Guest Partition Clearing ─────────────────────────────────────────────────────

/**
 * Clear all guest partitions for a specific local owner.
 * Used when guest data should be discarded (rare).
 *
 * @param localOwnerId - Local owner ID
 * @returns Promise resolving when clearing is complete
 */
export async function clearGuestPartitions(localOwnerId: LocalOwnerId): Promise<void> {
  console.log(`[StorageIsolation] Clearing guest partitions for ${localOwnerId}`);

  const entities = ["tasks", "habits", "settings", "preferences"];
  const keysToDelete: string[] = [];

  for (const entity of entities) {
    keysToDelete.push(getGuestPartitionKey(localOwnerId, entity));
  }

  // Delete sync queue
  keysToDelete.push(getSyncQueueKey(localOwnerId, true));

  // Perform deletion
  for (const key of keysToDelete) {
    try {
      await storage.delete(key);
    } catch (err) {
      console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
    }
  }

  console.log(`[StorageIsolation] Cleared ${keysToDelete.length} guest partitions`);
}

/**
 * Clear all guest partitions across all local owners.
 * Used for testing or full reset (use with caution).
 *
 * @returns Promise resolving when clearing is complete
 */
export async function clearAllGuestPartitions(): Promise<void> {
  console.log("[StorageIsolation] Clearing all guest partitions");

  // Get all keys
  const allKeys = await storage.getAllKeys();
  const guestKeys = allKeys.filter((key) => key.startsWith("guest:"));

  // Delete all guest keys
  for (const key of guestKeys) {
    try {
      await storage.delete(key);
    } catch (err) {
      console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
    }
  }

  console.log(`[StorageIsolation] Cleared ${guestKeys.length} guest partitions`);
}

// ── Sync Queue Clearing ─────────────────────────────────────────────────────────

/**
 * Clear sync queue for a specific owner.
 *
 * @param ownerId - Owner ID (local or cloud)
 * @param isGuest - Whether owner is guest
 * @returns Promise resolving when clearing is complete
 */
export async function clearSyncQueue(ownerId: string, isGuest: boolean): Promise<void> {
  const key = getSyncQueueKey(ownerId, isGuest);
  console.log(`[StorageIsolation] Clearing sync queue: ${key}`);

  try {
    await storage.delete(key);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete sync queue ${key}:`, err);
  }
}

/**
 * Clear all sync queues across all owners.
 * Used for testing or full reset (use with caution).
 *
 * @returns Promise resolving when clearing is complete
 */
export async function clearAllSyncQueues(): Promise<void> {
  console.log("[StorageIsolation] Clearing all sync queues");

  // Get all keys
  const allKeys = await storage.getAllKeys();
  const syncQueueKeys = allKeys.filter((key) => key.endsWith(":syncQueue"));

  // Delete all sync queue keys
  for (const key of syncQueueKeys) {
    try {
      await storage.delete(key);
    } catch (err) {
      console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
    }
  }

  console.log(`[StorageIsolation] Cleared ${syncQueueKeys.length} sync queues`);
}

// ── Ownership-Scoped Data Clearing ───────────────────────────────────────────────

/**
 * Clear all data scoped to a specific owner (both authenticated and guest).
 * Used for account switching or logout.
 *
 * @param ownerId - Owner ID
 * @param isGuest - Whether owner is guest
 * @returns Promise resolving when clearing is complete
 */
export async function clearOwnershipScopedData(
  ownerId: string,
  isGuest: boolean,
): Promise<void> {
  console.log(`[StorageIsolation] Clearing ownership-scoped data for ${isGuest ? "guest" : "user"}:${ownerId}`);

  if (isGuest) {
    await clearGuestPartitions(ownerId as LocalOwnerId);
  } else {
    await clearAuthenticatedPartitions(ownerId as CloudOwnerId);
  }
}

/**
 * Clear all data for a specific cloud owner while preserving guest data.
 * Used during authenticated logout.
 *
 * @param cloudOwnerId - Cloud owner ID
 * @returns Promise resolving when clearing is complete
 */
export async function clearCloudOwnerDataPreserveGuest(cloudOwnerId: CloudOwnerId): Promise<void> {
  console.log(`[StorageIsolation] Clearing cloud owner data while preserving guest: ${cloudOwnerId}`);

  // Clear authenticated partitions
  await clearAuthenticatedPartitions(cloudOwnerId);

  // Preserve all guest partitions (do nothing)
  console.log("[StorageIsolation] Guest data preserved");
}

// ── Storage Inspection ───────────────────────────────────────────────────────────

/**
 * Get all storage keys for a specific owner.
 *
 * @param ownerId - Owner ID
 * @param isGuest - Whether owner is guest
 * @returns Array of storage keys
 */
export async function getOwnerStorageKeys(ownerId: string, isGuest: boolean): Promise<string[]> {
  const allKeys = await storage.getAllKeys();
  const prefix = isGuest ? `guest:${ownerId}` : `user:${ownerId}`;
  return allKeys.filter((key) => key.startsWith(prefix));
}

/**
 * Get storage usage statistics for a specific owner.
 *
 * @param ownerId - Owner ID
 * @param isGuest - Whether owner is guest
 * @returns Storage usage statistics
 */
export async function getOwnerStorageStats(
  ownerId: string,
  isGuest: boolean,
): Promise<{ keyCount: number; keys: string[] }> {
  const keys = await getOwnerStorageKeys(ownerId, isGuest);
  return {
    keyCount: keys.length,
    keys,
  };
}

/**
 * Get total storage usage across all owners.
 *
 * @returns Total storage usage statistics
 */
export async function getTotalStorageStats(): Promise<{
  totalKeys: number;
  guestKeys: number;
  authenticatedKeys: number;
  syncQueueKeys: number;
}> {
  const allKeys = await storage.getAllKeys();
  const guestKeys = allKeys.filter((key) => key.startsWith("guest:")).length;
  const authenticatedKeys = allKeys.filter((key) => key.startsWith("user:")).length;
  const syncQueueKeys = allKeys.filter((key) => key.endsWith(":syncQueue")).length;

  return {
    totalKeys: allKeys.length,
    guestKeys,
    authenticatedKeys,
    syncQueueKeys,
  };
}
