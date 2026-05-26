/**
 * Deterministic Partition Copy Utilities
 *
 * Guest → account migration copy operations without destructive operations.
 * Copies data from guest partitions to authenticated partitions.
 *
 * Responsibilities:
 * - Copy entity data from guest to authenticated partitions
 * - Copy sync queue from guest to authenticated partitions
 * - Preserve data integrity during copy
 * - No deletion of source data
 * - No destructive operations
 * - Deterministic copy order
 */

import type { RepositoryContext } from "../types/auth.types";
import { getEntityStorageKey, getSyncQueueStorageKey } from "../../../services/storage/storagePartition";
import { storage as mmkvStorage } from "../../../store/storage";

// ── Migration Copy Types ───────────────────────────────────────────────────────

export interface CopyResult {
  entityName: string;
  sourceKey: string;
  targetKey: string;
  success: boolean;
  bytesCopied: number;
  itemsCopied: number;
  error?: string;
}

export interface MigrationCopyReport {
  sourceContext: RepositoryContext;
  targetContext: RepositoryContext;
  results: CopyResult[];
  totalBytesCopied: number;
  totalItemsCopied: number;
  duration: number; // in milliseconds
  success: boolean;
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

// ── Migration Copy Operations ───────────────────────────────────────────────────

/**
 * Copy all data from guest partitions to authenticated partitions.
 * This is a non-destructive copy operation.
 *
 * @param sourceContext - Guest repository context
 * @param targetContext - Authenticated repository context
 * @returns Migration copy report
 */
export function copyGuestToAuthenticated(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
): MigrationCopyReport {
  if (sourceContext.accountMode !== "guest") {
    throw new Error(
      "[MigrationCopy] Source context must be in guest mode",
    );
  }

  if (targetContext.accountMode !== "authenticated") {
    throw new Error(
      "[MigrationCopy] Target context must be in authenticated mode",
    );
  }

  const startTime = Date.now();
  const results: CopyResult[] = [];
  const errors: string[] = [];
  let totalBytesCopied = 0;
  let totalItemsCopied = 0;

  // Copy each entity in deterministic order
  for (const entityName of SUPPORTED_ENTITIES) {
    const result = copyEntityData(sourceContext, targetContext, entityName);
    results.push(result);

    if (result.success) {
      totalBytesCopied += result.bytesCopied;
      totalItemsCopied += result.itemsCopied;
    } else {
      errors.push(`${entityName}: ${result.error}`);
    }
  }

  // Copy sync queue
  const syncQueueResult = copySyncQueue(sourceContext, targetContext);
  results.push(syncQueueResult);

  if (syncQueueResult.success) {
    totalBytesCopied += syncQueueResult.bytesCopied;
    totalItemsCopied += syncQueueResult.itemsCopied;
  } else {
    errors.push(`syncQueue: ${syncQueueResult.error}`);
  }

  const duration = Date.now() - startTime;
  const success = errors.length === 0;

  return {
    sourceContext,
    targetContext,
    results,
    totalBytesCopied,
    totalItemsCopied,
    duration,
    success,
    errors,
  };
}

/**
 * Copy entity data from source to target.
 */
function copyEntityData(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
  entityName: string,
): CopyResult {
  const sourceKey = getEntityStorageKey(entityName, sourceContext);
  const targetKey = getEntityStorageKey(entityName, targetContext);

  if (!mmkvStorage) {
    return {
      entityName,
      sourceKey,
      targetKey,
      success: false,
      bytesCopied: 0,
      itemsCopied: 0,
      error: "MMKV storage not available",
    };
  }

  try {
    const sourceData = mmkvStorage.getString(sourceKey);

    if (!sourceData) {
      // No data to copy - this is not an error
      return {
        entityName,
        sourceKey,
        targetKey,
        success: true,
        bytesCopied: 0,
        itemsCopied: 0,
      };
    }

    // Copy data to target
    mmkvStorage.set(targetKey, sourceData);

    const bytesCopied = sourceData.length;
    const itemsCopied = parseItemCount(sourceData);

    return {
      entityName,
      sourceKey,
      targetKey,
      success: true,
      bytesCopied,
      itemsCopied,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      entityName,
      sourceKey,
      targetKey,
      success: false,
      bytesCopied: 0,
      itemsCopied: 0,
      error: message,
    };
  }
}

/**
 * Copy sync queue from source to target.
 */
function copySyncQueue(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
): CopyResult {
  const sourceKey = getSyncQueueStorageKey(sourceContext);
  const targetKey = getSyncQueueStorageKey(targetContext);

  if (!mmkvStorage) {
    return {
      entityName: "syncQueue",
      sourceKey,
      targetKey,
      success: false,
      bytesCopied: 0,
      itemsCopied: 0,
      error: "MMKV storage not available",
    };
  }

  try {
    const sourceData = mmkvStorage.getString(sourceKey);

    if (!sourceData) {
      // No data to copy - this is not an error
      return {
        entityName: "syncQueue",
        sourceKey,
        targetKey,
        success: true,
        bytesCopied: 0,
        itemsCopied: 0,
      };
    }

    // Copy data to target
    mmkvStorage.set(targetKey, sourceData);

    const bytesCopied = sourceData.length;
    const itemsCopied = parseItemCount(sourceData);

    return {
      entityName: "syncQueue",
      sourceKey,
      targetKey,
      success: true,
      bytesCopied,
      itemsCopied,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      entityName: "syncQueue",
      sourceKey,
      targetKey,
      success: false,
      bytesCopied: 0,
      itemsCopied: 0,
      error: message,
    };
  }
}

/**
 * Parse item count from JSON data.
 */
function parseItemCount(jsonData: string): number {
  try {
    const parsed = JSON.parse(jsonData);
    if (Array.isArray(parsed)) {
      return parsed.length;
    }
    if (typeof parsed === "object" && parsed !== null) {
      return Object.keys(parsed).length;
    }
    return 1;
  } catch {
    return 0;
  }
}

// ── Migration Copy Display ─────────────────────────────────────────────────────

/**
 * Get a human-readable summary of the migration copy report.
 */
export function summarizeMigrationCopy(report: MigrationCopyReport): string {
  const lines: string[] = [];

  lines.push(`Migration Copy Report`);
  lines.push(`Source: ${report.sourceContext.localOwnerId.slice(0, 8)}...`);
  lines.push(`Target: ${report.targetContext.cloudOwnerId?.slice(0, 8)}...`);
  lines.push(`Duration: ${report.duration}ms`);
  lines.push(``);

  lines.push(`Results:`);
  for (const result of report.results) {
    if (result.success) {
      lines.push(
        `  ✓ ${result.entityName}: ${result.itemsCopied} items (${result.bytesCopied} bytes)`,
      );
    } else {
      lines.push(
        `  ✗ ${result.entityName}: ${result.error}`,
      );
    }
  }

  lines.push(``);
  lines.push(`Total bytes copied: ${report.totalBytesCopied}`);
  lines.push(`Total items copied: ${report.totalItemsCopied}`);
  lines.push(`Success: ${report.success ? "Yes" : "No"}`);

  if (report.errors.length > 0) {
    lines.push(``);
    lines.push(`Errors:`);
    for (const error of report.errors) {
      lines.push(`  - ${error}`);
    }
  }

  return lines.join("\n");
}

/**
 * Check if copy was successful.
 */
export function isCopySuccessful(report: MigrationCopyReport): boolean {
  return report.success;
}

/**
 * Get copy errors.
 */
export function getCopyErrors(report: MigrationCopyReport): string[] {
  return report.errors;
}
