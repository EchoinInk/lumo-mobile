/**
 * Migration Conflict Strategy Scaffolding
 *
 * Guest → account migration conflict resolution strategies.
 * Defines how to handle conflicts when target data already exists.
 *
 * Responsibilities:
 * - Define conflict resolution strategies
 * - Detect conflict types
 * - Apply conflict resolution strategies
 * - Preserve data integrity during conflict resolution
 * - No destructive operations
 */

import { getEntityStorageKey } from "../../../services/storage/storagePartition";
import { storageInstance as mmkvStorage } from "../../../store/storage";
import type { RepositoryContext } from "../types/auth.types";

// ── Conflict Strategy Types ─────────────────────────────────────────────────────

export type ConflictResolutionStrategy =
  | "skip" // Skip migration of this entity
  | "overwrite" // Overwrite target with source
  | "merge" // Merge source and target (requires custom logic)
  | "rename" // Rename source to avoid conflict
  | "abort"; // Abort entire migration

export interface ConflictInfo {
  entityName: string;
  sourceKey: string;
  targetKey: string;
  conflictType: "key_collision" | "data_conflict" | "schema_mismatch";
  severity: "low" | "medium" | "high";
  description: string;
  recommendedStrategy: ConflictResolutionStrategy;
}

export interface ConflictResolution {
  entityName: string;
  strategy: ConflictResolutionStrategy;
  applied: boolean;
  success: boolean;
  error?: string;
}

export interface ConflictResolutionReport {
  conflicts: ConflictInfo[];
  resolutions: ConflictResolution[];
  strategy: ConflictResolutionStrategy;
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

// ── Conflict Detection ───────────────────────────────────────────────────────────

/**
 * Detect conflicts between source and target contexts.
 *
 * @param sourceContext - Guest repository context
 * @param targetContext - Authenticated repository context
 * @returns List of detected conflicts
 */
export function detectConflicts(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
): ConflictInfo[] {
  if (sourceContext.accountMode !== "guest") {
    throw new Error("[ConflictStrategy] Source context must be in guest mode");
  }

  if (targetContext.accountMode !== "authenticated") {
    throw new Error(
      "[ConflictStrategy] Target context must be in authenticated mode",
    );
  }

  const conflicts: ConflictInfo[] = [];

  // Check each entity for conflicts
  for (const entityName of SUPPORTED_ENTITIES) {
    const conflict = detectEntityConflict(
      sourceContext,
      targetContext,
      entityName,
    );
    if (conflict) {
      conflicts.push(conflict);
    }
  }

  return conflicts;
}

/**
 * Detect conflict for a specific entity.
 */
function detectEntityConflict(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
  entityName: string,
): ConflictInfo | null {
  const sourceKey = getEntityStorageKey(entityName, sourceContext);
  const targetKey = getEntityStorageKey(entityName, targetContext);

  if (!mmkvStorage) {
    return null;
  }

  const sourceData = mmkvStorage.getString(sourceKey);
  const targetData = mmkvStorage.getString(targetKey);

  // No conflict if source doesn't exist
  if (!sourceData) {
    return null;
  }

  // No conflict if target doesn't exist
  if (!targetData) {
    return null;
  }

  // Conflict: both source and target exist
  const conflictType: ConflictInfo["conflictType"] = "key_collision";
  const severity: ConflictInfo["severity"] = "high";
  const description = `${entityName} already exists in target partition`;
  const recommendedStrategy: ConflictResolutionStrategy = "merge";

  return {
    entityName,
    sourceKey,
    targetKey,
    conflictType,
    severity,
    description,
    recommendedStrategy,
  };
}

// ── Conflict Resolution Strategies ─────────────────────────────────────────────

/**
 * Apply conflict resolution strategy.
 *
 * @param conflict - Conflict information
 * @param strategy - Resolution strategy to apply
 * @returns Conflict resolution result
 */
export function applyConflictResolution(
  conflict: ConflictInfo,
  strategy: ConflictResolutionStrategy,
): ConflictResolution {
  if (!mmkvStorage) {
    return {
      entityName: conflict.entityName,
      strategy,
      applied: false,
      success: false,
      error: "MMKV storage not available",
    };
  }

  try {
    switch (strategy) {
      case "skip":
        return {
          entityName: conflict.entityName,
          strategy,
          applied: true,
          success: true,
        };

      case "overwrite":
        return applyOverwriteStrategy(conflict);

      case "merge":
        return applyMergeStrategy(conflict);

      case "rename":
        return applyRenameStrategy(conflict);

      case "abort":
        return {
          entityName: conflict.entityName,
          strategy,
          applied: true,
          success: false,
          error: "Migration aborted due to conflict",
        };

      default:
        return {
          entityName: conflict.entityName,
          strategy,
          applied: false,
          success: false,
          error: "Unknown strategy",
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      entityName: conflict.entityName,
      strategy,
      applied: false,
      success: false,
      error: message,
    };
  }
}

/**
 * Apply overwrite strategy: replace target with source.
 */
function applyOverwriteStrategy(conflict: ConflictInfo): ConflictResolution {
  const sourceData = mmkvStorage?.getString(conflict.sourceKey);

  if (!sourceData) {
    return {
      entityName: conflict.entityName,
      strategy: "overwrite",
      applied: false,
      success: false,
      error: "Source data not found",
    };
  }

  mmkvStorage?.set(conflict.targetKey, sourceData);

  return {
    entityName: conflict.entityName,
    strategy: "overwrite",
    applied: true,
    success: true,
  };
}

/**
 * Apply merge strategy: merge source and target data.
 * This is a placeholder for custom merge logic.
 */
function applyMergeStrategy(conflict: ConflictInfo): ConflictResolution {
  // Placeholder: merge logic would be entity-specific
  // For now, we'll skip merge and recommend manual resolution
  return {
    entityName: conflict.entityName,
    strategy: "merge",
    applied: false,
    success: false,
    error:
      "Merge strategy not yet implemented - requires custom logic per entity",
  };
}

/**
 * Apply rename strategy: rename source to avoid conflict.
 * This is a placeholder for rename logic.
 */
function applyRenameStrategy(conflict: ConflictInfo): ConflictResolution {
  // Placeholder: rename logic would append a suffix to source key
  return {
    entityName: conflict.entityName,
    strategy: "rename",
    applied: false,
    success: false,
    error: "Rename strategy not yet implemented",
  };
}

// ── Batch Conflict Resolution ───────────────────────────────────────────────────

/**
 * Apply conflict resolution to all conflicts using a single strategy.
 *
 * @param conflicts - List of conflicts
 * @param strategy - Resolution strategy to apply to all
 * @returns Conflict resolution report
 */
export function resolveAllConflicts(
  conflicts: ConflictInfo[],
  strategy: ConflictResolutionStrategy,
): ConflictResolutionReport {
  const resolutions: ConflictResolution[] = [];
  const errors: string[] = [];

  for (const conflict of conflicts) {
    const resolution = applyConflictResolution(conflict, strategy);
    resolutions.push(resolution);

    if (!resolution.success) {
      errors.push(`${conflict.entityName}: ${resolution.error}`);
    }
  }

  const success = errors.length === 0;

  return {
    conflicts,
    resolutions,
    strategy,
    success,
    errors,
  };
}

// ── Conflict Strategy Display ─────────────────────────────────────────────────

/**
 * Get a human-readable summary of conflicts.
 */
export function summarizeConflicts(conflicts: ConflictInfo[]): string {
  if (conflicts.length === 0) {
    return "No conflicts detected.";
  }

  const lines: string[] = [];

  lines.push(`Conflicts Detected: ${conflicts.length}`);
  lines.push(``);

  for (const conflict of conflicts) {
    lines.push(`- ${conflict.entityName}:`);
    lines.push(`  Type: ${conflict.conflictType}`);
    lines.push(`  Severity: ${conflict.severity}`);
    lines.push(`  Description: ${conflict.description}`);
    lines.push(`  Recommended: ${conflict.recommendedStrategy}`);
    lines.push(``);
  }

  return lines.join("\n");
}

/**
 * Get recommended strategy for a conflict.
 */
export function getRecommendedStrategy(
  conflict: ConflictInfo,
): ConflictResolutionStrategy {
  return conflict.recommendedStrategy;
}

/**
 * Check if conflicts are resolvable.
 */
export function areConflictsResolvable(conflicts: ConflictInfo[]): boolean {
  return conflicts.every((c) => c.recommendedStrategy !== "abort");
}
