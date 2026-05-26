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

import type { RepositoryContext } from "../../features/auth/types/auth.types";
import { storageInstance as mmkvStorage } from "../../store/storage";
import {
    getEntityStorageKey,
    getMigrationStorageKey,
    getSyncQueueStorageKey,
} from "./storagePartition";

// ── Supported Entities ─────────────────────────────────────────────────────────────

const SUPPORTED_ENTITIES = [
  "tasks",
  "habits",
  "meals",
  "budget",
  "workouts",
  "calendar",
] as const;

// ── Guest Partition Clearing ─────────────────────────────────────────────────────

/**
 * Clear all guest partitions for a given repository context.
 * Removes all entity data, sync queue, and migration metadata for the guest.
 *
 * @param context - Guest repository context
 */
export function clearGuestPartitions(context: RepositoryContext): void {
  if (context.accountMode !== "guest") {
    throw new Error(
      "[StorageIsolation] Cannot clear guest partitions: context is not in guest mode",
    );
  }

  console.log(
    `[StorageIsolation] Clearing guest partitions for ${context.localOwnerId}`,
  );

  if (!mmkvStorage) {
    console.warn("[StorageIsolation] MMKV storage not available");
    return;
  }

  // Clear entity partitions
  for (const entity of SUPPORTED_ENTITIES) {
    const key = getEntityStorageKey(entity, context);
    try {
      mmkvStorage.remove(key);
    } catch (err) {
      console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
    }
  }

  // Clear sync queue
  const syncQueueKey = getSyncQueueStorageKey(context);
  try {
    mmkvStorage.remove(syncQueueKey);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete ${syncQueueKey}:`, err);
  }

  // Clear migration metadata
  const migrationKey = getMigrationStorageKey(context);
  try {
    mmkvStorage.remove(migrationKey);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete ${migrationKey}:`, err);
  }

  console.log(
    `[StorageIsolation] Cleared guest partitions for ${context.localOwnerId}`,
  );
}

// ── Authenticated Partition Clearing ─────────────────────────────────────────────

/**
 * Clear all authenticated partitions for a given repository context.
 * Removes all entity data, sync queue, and migration metadata for the authenticated user.
 *
 * @param context - Authenticated repository context
 */
export function clearAuthenticatedPartitions(context: RepositoryContext): void {
  if (context.accountMode !== "authenticated") {
    throw new Error(
      "[StorageIsolation] Cannot clear authenticated partitions: context is not in authenticated mode",
    );
  }

  console.log(
    `[StorageIsolation] Clearing authenticated partitions for ${context.cloudOwnerId}`,
  );

  if (!mmkvStorage) {
    console.warn("[StorageIsolation] MMKV storage not available");
    return;
  }

  // Clear entity partitions
  for (const entity of SUPPORTED_ENTITIES) {
    const key = getEntityStorageKey(entity, context);
    try {
      mmkvStorage.remove(key);
    } catch (err) {
      console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
    }
  }

  // Clear sync queue
  const syncQueueKey = getSyncQueueStorageKey(context);
  try {
    mmkvStorage.remove(syncQueueKey);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete ${syncQueueKey}:`, err);
  }

  // Clear migration metadata
  const migrationKey = getMigrationStorageKey(context);
  try {
    mmkvStorage.remove(migrationKey);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete ${migrationKey}:`, err);
  }

  console.log(
    `[StorageIsolation] Cleared authenticated partitions for ${context.cloudOwnerId}`,
  );
}

// ── Sync Queue Clearing ─────────────────────────────────────────────────────────

/**
 * Clear sync queue for a given repository context.
 *
 * @param context - Repository context
 */
export function clearSyncPartitions(context: RepositoryContext): void {
  console.log(
    `[StorageIsolation] Clearing sync queue for ${context.accountMode === "guest" ? context.localOwnerId : context.cloudOwnerId}`,
  );

  if (!mmkvStorage) {
    console.warn("[StorageIsolation] MMKV storage not available");
    return;
  }

  const syncQueueKey = getSyncQueueStorageKey(context);
  try {
    mmkvStorage.remove(syncQueueKey);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete ${syncQueueKey}:`, err);
  }

  console.log(`[StorageIsolation] Cleared sync queue`);
}

// ── Ownership-Scoped Data Clearing ───────────────────────────────────────────────

/**
 * Clear all data scoped to a specific repository context.
 * This includes entity data, sync queue, and migration metadata.
 *
 * @param context - Repository context
 */
export function clearOwnershipScopedData(context: RepositoryContext): void {
  console.log(
    `[StorageIsolation] Clearing ownership-scoped data for ${context.accountMode} mode`,
  );

  if (context.accountMode === "guest") {
    clearGuestPartitions(context);
  } else {
    clearAuthenticatedPartitions(context);
  }
}

/**
 * Clear cloud owner data while preserving guest data.
 * Used during authenticated logout to isolate cloud-owned cache.
 *
 * @param context - Authenticated repository context
 */
export function clearCloudOwnerDataPreserveGuest(
  context: RepositoryContext,
): void {
  if (context.accountMode !== "authenticated") {
    throw new Error(
      "[StorageIsolation] Cannot clear cloud owner data: context is not in authenticated mode",
    );
  }

  console.log(
    `[StorageIsolation] Clearing cloud owner data while preserving guest: ${context.cloudOwnerId}`,
  );

  // Clear authenticated partitions only
  clearAuthenticatedPartitions(context);

  // Guest data is preserved (do nothing)
  console.log("[StorageIsolation] Guest data preserved");
}

// ── Entity-Specific Clearing ─────────────────────────────────────────────────────

/**
 * Clear a specific entity partition for a given repository context.
 *
 * @param entity - Entity name (e.g., "tasks", "habits")
 * @param context - Repository context
 */
export function clearEntityPartition(
  entity: string,
  context: RepositoryContext,
): void {
  console.log(`[StorageIsolation] Clearing entity partition: ${entity}`);

  if (!mmkvStorage) {
    console.warn("[StorageIsolation] MMKV storage not available");
    return;
  }

  const key = getEntityStorageKey(entity, context);
  try {
    mmkvStorage.remove(key);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete ${key}:`, err);
  }

  console.log(`[StorageIsolation] Cleared entity partition: ${entity}`);
}

/**
 * Clear multiple entity partitions for a given repository context.
 *
 * @param entities - Array of entity names
 * @param context - Repository context
 */
export function clearEntityPartitions(
  entities: string[],
  context: RepositoryContext,
): void {
  console.log(
    `[StorageIsolation] Clearing entity partitions: ${entities.join(", ")}`,
  );

  for (const entity of entities) {
    clearEntityPartition(entity, context);
  }
}

// ── Migration Metadata Clearing ───────────────────────────────────────────────────

/**
 * Clear migration metadata for a given repository context.
 *
 * @param context - Repository context
 */
export function clearMigrationMetadata(context: RepositoryContext): void {
  console.log(
    `[StorageIsolation] Clearing migration metadata for ${context.accountMode} mode`,
  );

  if (!mmkvStorage) {
    console.warn("[StorageIsolation] MMKV storage not available");
    return;
  }

  const migrationKey = getMigrationStorageKey(context);
  try {
    mmkvStorage.remove(migrationKey);
  } catch (err) {
    console.error(`[StorageIsolation] Failed to delete ${migrationKey}:`, err);
  }

  console.log(`[StorageIsolation] Cleared migration metadata`);
}
