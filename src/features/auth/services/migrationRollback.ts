/**
 * Safe Rollback Path Utilities
 *
 * Guest → account migration rollback utilities.
 * Provides safe rollback path if migration fails or needs to be undone.
 *
 * Responsibilities:
 * - Create rollback snapshot before migration
 * - Restore from rollback snapshot
 * - Clean up rollback snapshots
 * - Validate rollback integrity
 * - No destructive operations on source data
 */

import {
    getEntityStorageKey,
    getSyncQueueStorageKey,
} from "../../../services/storage/storagePartition";
import { storageInstance as mmkvStorage } from "../../../store/storage";
import type { RepositoryContext } from "../types/auth.types";

// ── Rollback Types ─────────────────────────────────────────────────────────────

export interface RollbackSnapshot {
  id: string;
  timestamp: number;
  sourceContext: RepositoryContext;
  targetContext: RepositoryContext;
  targetDataBackup: Map<string, string>;
}

export interface RollbackResult {
  snapshotId: string;
  success: boolean;
  entitiesRestored: number;
  errors: string[];
}

// ── Supported Entities ───────────────────────────────────────────────────────────

const SUPPORTED_ENTITIES = [
  "tasks",
  "habits",
  "meals",
  "budget",
  "workouts",
  "calendar",
] as const;

// ── Rollback Snapshot Creation ───────────────────────────────────────────────────

/**
 * Create a rollback snapshot of target context before migration.
 * This captures the current state of authenticated partitions.
 *
 * @param targetContext - Authenticated repository context
 * @returns Rollback snapshot
 */
export function createRollbackSnapshot(
  targetContext: RepositoryContext,
): RollbackSnapshot {
  if (targetContext.accountMode !== "authenticated") {
    throw new Error("[Rollback] Target context must be in authenticated mode");
  }

  const snapshotId = generateSnapshotId();
  const timestamp = Date.now();
  const targetDataBackup = new Map<string, string>();

  // Backup each entity in target partition
  for (const entityName of SUPPORTED_ENTITIES) {
    const targetKey = getEntityStorageKey(entityName, targetContext);
    const targetData = mmkvStorage?.getString(targetKey);

    if (targetData) {
      targetDataBackup.set(targetKey, targetData);
    }
  }

  // Backup sync queue
  const syncQueueKey = getSyncQueueStorageKey(targetContext);
  const syncQueueData = mmkvStorage?.getString(syncQueueKey);

  if (syncQueueData) {
    targetDataBackup.set(syncQueueKey, syncQueueData);
  }

  return {
    id: snapshotId,
    timestamp,
    sourceContext: targetContext, // Store as source for rollback
    targetContext,
    targetDataBackup,
  };
}

/**
 * Generate a unique snapshot ID.
 */
function generateSnapshotId(): string {
  return `rollback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ── Rollback Restoration ───────────────────────────────────────────────────────

/**
 * Restore target context from rollback snapshot.
 * This reverts authenticated partitions to their pre-migration state.
 *
 * @param snapshot - Rollback snapshot to restore from
 * @returns Rollback result
 */
export function restoreFromSnapshot(
  snapshot: RollbackSnapshot,
): RollbackResult {
  if (!mmkvStorage) {
    return {
      snapshotId: snapshot.id,
      success: false,
      entitiesRestored: 0,
      errors: ["MMKV storage not available"],
    };
  }

  const errors: string[] = [];
  let entitiesRestored = 0;

  try {
    // Restore each entity from backup
    for (const [key, data] of snapshot.targetDataBackup.entries()) {
      try {
        mmkvStorage.set(key, data);
        entitiesRestored++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to restore ${key}: ${message}`);
      }
    }

    // Delete any keys that were not in the backup (new keys created during migration)
    // This is a safety measure to ensure clean rollback
    for (const entityName of SUPPORTED_ENTITIES) {
      const targetKey = getEntityStorageKey(entityName, snapshot.targetContext);

      if (!snapshot.targetDataBackup.has(targetKey)) {
        // Key was created during migration, delete it
        mmkvStorage.remove(targetKey);
      }
    }

    // Check sync queue
    const syncQueueKey = getSyncQueueStorageKey(snapshot.targetContext);
    if (!snapshot.targetDataBackup.has(syncQueueKey)) {
      // Sync queue was created during migration, delete it
      mmkvStorage.remove(syncQueueKey);
    }

    const success = errors.length === 0;

    return {
      snapshotId: snapshot.id,
      success,
      entitiesRestored,
      errors,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      snapshotId: snapshot.id,
      success: false,
      entitiesRestored,
      errors: [`Rollback failed: ${message}`],
    };
  }
}

// ── Rollback Cleanup ───────────────────────────────────────────────────────────

/**
 * Clean up rollback snapshot data.
 * This removes the snapshot from memory (in-memory only for now).
 *
 * @param snapshot - Rollback snapshot to clean up
 */
export function cleanupSnapshot(snapshot: RollbackSnapshot): void {
  // Since snapshots are in-memory, we just clear the map
  snapshot.targetDataBackup.clear();
}

/**
 * Clean up all rollback snapshots.
 * This is a no-op for in-memory snapshots but provides API consistency.
 */
export function cleanupAllSnapshots(): void {
  // No-op for in-memory snapshots
  // In a future implementation with persistent snapshots, this would clean up storage
}

// ── Rollback Validation ─────────────────────────────────────────────────────────

/**
 * Validate that rollback was successful by comparing current state to snapshot.
 *
 * @param snapshot - Rollback snapshot to validate against
 * @returns Validation result
 */
export function validateRollback(snapshot: RollbackSnapshot): {
  valid: boolean;
  errors: string[];
} {
  if (!mmkvStorage) {
    return {
      valid: false,
      errors: ["MMKV storage not available"],
    };
  }

  const errors: string[] = [];

  // Validate each entity
  for (const [key, expectedData] of snapshot.targetDataBackup.entries()) {
    const currentData = mmkvStorage.getString(key);

    if (currentData !== expectedData) {
      errors.push(`Data mismatch for ${key}`);
    }
  }

  // Validate that no extra keys exist
  for (const entityName of SUPPORTED_ENTITIES) {
    const targetKey = getEntityStorageKey(entityName, snapshot.targetContext);

    if (!snapshot.targetDataBackup.has(targetKey)) {
      const currentData = mmkvStorage.getString(targetKey);
      if (currentData) {
        errors.push(`Extra key exists after rollback: ${targetKey}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ── Rollback Display ───────────────────────────────────────────────────────────

/**
 * Get a human-readable summary of a rollback snapshot.
 */
export function summarizeSnapshot(snapshot: RollbackSnapshot): string {
  const lines: string[] = [];

  lines.push(`Rollback Snapshot`);
  lines.push(`ID: ${snapshot.id}`);
  lines.push(`Timestamp: ${new Date(snapshot.timestamp).toISOString()}`);
  lines.push(`Context: ${snapshot.targetContext.cloudOwnerId?.slice(0, 8)}...`);
  lines.push(``);

  lines.push(`Backed up entities: ${snapshot.targetDataBackup.size}`);
  for (const [key] of snapshot.targetDataBackup.entries()) {
    lines.push(`  - ${key}`);
  }

  return lines.join("\n");
}

/**
 * Get a human-readable summary of a rollback result.
 */
export function summarizeRollbackResult(result: RollbackResult): string {
  const lines: string[] = [];

  lines.push(`Rollback Result`);
  lines.push(`Snapshot ID: ${result.snapshotId}`);
  lines.push(`Success: ${result.success ? "Yes" : "No"}`);
  lines.push(`Entities restored: ${result.entitiesRestored}`);
  lines.push(``);

  if (result.errors.length > 0) {
    lines.push(`Errors:`);
    for (const error of result.errors) {
      lines.push(`  - ${error}`);
    }
  }

  return lines.join("\n");
}
