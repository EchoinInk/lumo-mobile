/**
 * Migration Preview Utilities
 *
 * Guest → account migration preview without destructive operations.
 * Scans guest partitions and shows what would be migrated.
 *
 * Responsibilities:
 * - Scan guest partitions for data
 * - Calculate migration size/complexity
 * - Identify potential conflicts
 * - Generate migration preview report
 * - No destructive operations
 * - No data deletion
 */

import type { RepositoryContext } from "../../types/auth.types";
import { getEntityStorageKey } from "../../../services/storage/storagePartition";
import { storage as mmkvStorage } from "../../../store/storage";

// ── Migration Preview Types ─────────────────────────────────────────────────────

export interface EntityData {
  entityName: string;
  key: string;
  dataSize: number;
  itemCount: number;
  exists: boolean;
}

export interface MigrationPreview {
  sourceContext: RepositoryContext;
  targetContext: RepositoryContext;
  entities: EntityData[];
  totalDataSize: number;
  totalItemCount: number;
  estimatedDuration: number; // in milliseconds
  potentialConflicts: string[];
  canMigrate: boolean;
}

export interface ConflictInfo {
  entityName: string;
  conflictType: "key_collision" | "data_conflict" | "schema_mismatch";
  severity: "low" | "medium" | "high";
  description: string;
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

// ── Migration Preview ───────────────────────────────────────────────────────────

/**
 * Generate a migration preview for guest → account migration.
 * Scans guest partitions and calculates migration complexity.
 *
 * @param sourceContext - Guest repository context
 * @param targetContext - Authenticated repository context
 * @returns Migration preview report
 */
export function generateMigrationPreview(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
): MigrationPreview {
  if (sourceContext.accountMode !== "guest") {
    throw new Error(
      "[MigrationPreview] Source context must be in guest mode",
    );
  }

  if (targetContext.accountMode !== "authenticated") {
    throw new Error(
      "[MigrationPreview] Target context must be in authenticated mode",
    );
  }

  const entities: EntityData[] = [];
  let totalDataSize = 0;
  let totalItemCount = 0;

  // Scan each entity in guest partition
  for (const entityName of SUPPORTED_ENTITIES) {
    const sourceKey = getEntityStorageKey(entityName, sourceContext);
    const targetKey = getEntityStorageKey(entityName, targetContext);

    const entityData = scanEntityData(sourceKey, targetKey, entityName);
    entities.push(entityData);

    totalDataSize += entityData.dataSize;
    totalItemCount += entityData.itemCount;
  }

  // Scan sync queue
  const syncQueueData = scanSyncQueue(sourceContext);
  totalDataSize += syncQueueData.dataSize;
  totalItemCount += syncQueueData.itemCount;

  // Identify potential conflicts
  const potentialConflicts = identifyConflicts(entities, targetContext);

  // Estimate duration (rough heuristic: 1ms per 100 bytes)
  const estimatedDuration = Math.ceil(totalDataSize / 100);

  return {
    sourceContext,
    targetContext,
    entities,
    totalDataSize,
    totalItemCount,
    estimatedDuration,
    potentialConflicts,
    canMigrate: potentialConflicts.filter((c) => c.includes("high")).length === 0,
  };
}

/**
 * Scan entity data from storage.
 */
function scanEntityData(
  sourceKey: string,
  targetKey: string,
  entityName: string,
): EntityData {
  if (!mmkvStorage) {
    return {
      entityName,
      key: sourceKey,
      dataSize: 0,
      itemCount: 0,
      exists: false,
    };
  }

  const sourceData = mmkvStorage.getString(sourceKey);
  const targetData = mmkvStorage.getString(targetKey);

  const exists = sourceData !== null;
  const dataSize = sourceData ? sourceData.length : 0;
  const itemCount = sourceData ? parseItemCount(sourceData) : 0;

  return {
    entityName,
    key: sourceKey,
    dataSize,
    itemCount,
    exists,
  };
}

/**
 * Scan sync queue data.
 */
function scanSyncQueue(context: RepositoryContext): EntityData {
  if (!mmkvStorage) {
    return {
      entityName: "syncQueue",
      key: context.syncPartitionKey,
      dataSize: 0,
      itemCount: 0,
      exists: false,
    };
  }

  const syncQueueData = mmkvStorage.getString(context.syncPartitionKey);

  const exists = syncQueueData !== null;
  const dataSize = syncQueueData ? syncQueueData.length : 0;
  const itemCount = syncQueueData ? parseItemCount(syncQueueData) : 0;

  return {
    entityName: "syncQueue",
    key: context.syncPartitionKey,
    dataSize,
    itemCount,
    exists,
  };
}

/**
 * Parse item count from JSON data.
 * This is a rough heuristic for preview purposes.
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

/**
 * Identify potential conflicts between source and target.
 */
function identifyConflicts(
  entities: EntityData[],
  targetContext: RepositoryContext,
): string[] {
  const conflicts: string[] = [];

  for (const entity of entities) {
    if (!entity.exists) {
      continue;
    }

    const targetKey = getEntityStorageKey(entity.entityName, targetContext);
    const targetData = mmkvStorage?.getString(targetKey);

    if (targetData) {
      conflicts.push(
        `high: ${entity.entityName} already exists in target partition`,
      );
    }
  }

  // Check if target sync queue has items
  const targetSyncQueueData = mmkvStorage?.getString(targetContext.syncPartitionKey);
  if (targetSyncQueueData) {
    conflicts.push("medium: Target sync queue already has items");
  }

  return conflicts;
}

// ── Migration Preview Display ───────────────────────────────────────────────────

/**
 * Get a human-readable summary of the migration preview.
 */
export function summarizeMigrationPreview(preview: MigrationPreview): string {
  const lines: string[] = [];

  lines.push(`Migration Preview`);
  lines.push(`Source: ${preview.sourceContext.localOwnerId.slice(0, 8)}...`);
  lines.push(`Target: ${preview.targetContext.cloudOwnerId?.slice(0, 8)}...`);
  lines.push(``);

  lines.push(`Entities to migrate:`);
  for (const entity of preview.entities) {
    if (entity.exists) {
      lines.push(
        `  - ${entity.entityName}: ${entity.itemCount} items (${entity.dataSize} bytes)`,
      );
    }
  }

  lines.push(``);
  lines.push(`Total data size: ${preview.totalDataSize} bytes`);
  lines.push(`Total items: ${preview.totalItemCount}`);
  lines.push(`Estimated duration: ${preview.estimatedDuration}ms`);
  lines.push(``);

  if (preview.potentialConflicts.length > 0) {
    lines.push(`Potential conflicts:`);
    for (const conflict of preview.potentialConflicts) {
      lines.push(`  - ${conflict}`);
    }
  } else {
    lines.push(`No conflicts detected.`);
  }

  lines.push(``);
  lines.push(`Can migrate: ${preview.canMigrate ? "Yes" : "No"}`);

  return lines.join("\n");
}

/**
 * Check if migration is safe to proceed.
 */
export function isMigrationSafe(preview: MigrationPreview): boolean {
  return preview.canMigrate && preview.totalItemCount > 0;
}

/**
 * Get migration warnings.
 */
export function getMigrationWarnings(preview: MigrationPreview): string[] {
  const warnings: string[] = [];

  if (preview.totalDataSize > 1000000) {
    warnings.push("Large data size (>1MB) - migration may take longer");
  }

  if (preview.totalItemCount > 1000) {
    warnings.push("Many items (>1000) - migration may take longer");
  }

  if (preview.estimatedDuration > 5000) {
    warnings.push("Estimated duration >5s - consider background migration");
  }

  for (const conflict of preview.potentialConflicts) {
    if (conflict.includes("high")) {
      warnings.push(`High severity conflict: ${conflict}`);
    }
  }

  return warnings;
}
