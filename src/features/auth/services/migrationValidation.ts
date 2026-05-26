/**
 * Migration Validation Utilities
 *
 * Guest → account migration validation to ensure data integrity.
 * Validates copied data against source data.
 *
 * Responsibilities:
 * - Validate copied data integrity
 * - Verify entity counts match
 * - Verify data structure consistency
 * - Detect data corruption during copy
 * - No destructive operations
 */

import {
    getEntityStorageKey,
    getSyncQueueStorageKey,
} from "../../../services/storage/storagePartition";
import { storage as mmkvStorage } from "../../../store/storage";
import type { RepositoryContext } from "../types/auth.types";

// ── Migration Validation Types ───────────────────────────────────────────────────

export interface ValidationResult {
  entityName: string;
  sourceKey: string;
  targetKey: string;
  sourceExists: boolean;
  targetExists: boolean;
  itemCountMatch: boolean;
  dataIntegrityValid: boolean;
  error?: string;
}

export interface MigrationValidationReport {
  sourceContext: RepositoryContext;
  targetContext: RepositoryContext;
  results: ValidationResult[];
  totalEntitiesValidated: number;
  validEntities: number;
  invalidEntities: number;
  overallValid: boolean;
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

// ── Migration Validation Operations ─────────────────────────────────────────────

/**
 * Validate that copied data matches source data.
 *
 * @param sourceContext - Guest repository context
 * @param targetContext - Authenticated repository context
 * @returns Migration validation report
 */
export function validateMigrationCopy(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
): MigrationValidationReport {
  if (sourceContext.accountMode !== "guest") {
    throw new Error(
      "[MigrationValidation] Source context must be in guest mode",
    );
  }

  if (targetContext.accountMode !== "authenticated") {
    throw new Error(
      "[MigrationValidation] Target context must be in authenticated mode",
    );
  }

  const results: ValidationResult[] = [];
  const errors: string[] = [];

  // Validate each entity
  for (const entityName of SUPPORTED_ENTITIES) {
    const result = validateEntityData(sourceContext, targetContext, entityName);
    results.push(result);

    if (!result.dataIntegrityValid) {
      errors.push(`${entityName}: ${result.error}`);
    }
  }

  // Validate sync queue
  const syncQueueResult = validateSyncQueue(sourceContext, targetContext);
  results.push(syncQueueResult);

  if (!syncQueueResult.dataIntegrityValid) {
    errors.push(`syncQueue: ${syncQueueResult.error}`);
  }

  const totalEntitiesValidated = results.length;
  const validEntities = results.filter((r) => r.dataIntegrityValid).length;
  const invalidEntities = results.filter((r) => !r.dataIntegrityValid).length;
  const overallValid = invalidEntities === 0;

  return {
    sourceContext,
    targetContext,
    results,
    totalEntitiesValidated,
    validEntities,
    invalidEntities,
    overallValid,
    errors,
  };
}

/**
 * Validate entity data integrity.
 */
function validateEntityData(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
  entityName: string,
): ValidationResult {
  const sourceKey = getEntityStorageKey(entityName, sourceContext);
  const targetKey = getEntityStorageKey(entityName, targetContext);

  if (!mmkvStorage) {
    return {
      entityName,
      sourceKey,
      targetKey,
      sourceExists: false,
      targetExists: false,
      itemCountMatch: false,
      dataIntegrityValid: false,
      error: "MMKV storage not available",
    };
  }

  try {
    const sourceData = mmkvStorage.getString(sourceKey);
    const targetData = mmkvStorage.getString(targetKey);

    const sourceExists = sourceData !== null;
    const targetExists = targetData !== null;

    // If source doesn't exist, validation passes (nothing to validate)
    if (!sourceExists) {
      return {
        entityName,
        sourceKey,
        targetKey,
        sourceExists,
        targetExists,
        itemCountMatch: true,
        dataIntegrityValid: true,
      };
    }

    // If source exists but target doesn't, validation fails
    if (sourceExists && !targetExists) {
      return {
        entityName,
        sourceKey,
        targetKey,
        sourceExists,
        targetExists,
        itemCountMatch: false,
        dataIntegrityValid: false,
        error: "Source data exists but target data missing",
      };
    }

    // Validate item count match
    const sourceItemCount = sourceData ? parseItemCount(sourceData) : 0;
    const targetItemCount = targetData ? parseItemCount(targetData) : 0;
    const itemCountMatch = sourceItemCount === targetItemCount;

    // Validate data integrity (simple length check for now)
    const dataIntegrityValid = itemCountMatch && sourceData === targetData;

    return {
      entityName,
      sourceKey,
      targetKey,
      sourceExists,
      targetExists,
      itemCountMatch,
      dataIntegrityValid,
      error: !dataIntegrityValid ? "Data integrity check failed" : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      entityName,
      sourceKey,
      targetKey,
      sourceExists: false,
      targetExists: false,
      itemCountMatch: false,
      dataIntegrityValid: false,
      error: message,
    };
  }
}

/**
 * Validate sync queue integrity.
 */
function validateSyncQueue(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
): ValidationResult {
  const sourceKey = getSyncQueueStorageKey(sourceContext);
  const targetKey = getSyncQueueStorageKey(targetContext);

  if (!mmkvStorage) {
    return {
      entityName: "syncQueue",
      sourceKey,
      targetKey,
      sourceExists: false,
      targetExists: false,
      itemCountMatch: false,
      dataIntegrityValid: false,
      error: "MMKV storage not available",
    };
  }

  try {
    const sourceData = mmkvStorage.getString(sourceKey);
    const targetData = mmkvStorage.getString(targetKey);

    const sourceExists = sourceData !== null;
    const targetExists = targetData !== null;

    // If source doesn't exist, validation passes
    if (!sourceExists) {
      return {
        entityName: "syncQueue",
        sourceKey,
        targetKey,
        sourceExists,
        targetExists,
        itemCountMatch: true,
        dataIntegrityValid: true,
      };
    }

    // If source exists but target doesn't, validation fails
    if (sourceExists && !targetExists) {
      return {
        entityName: "syncQueue",
        sourceKey,
        targetKey,
        sourceExists,
        targetExists,
        itemCountMatch: false,
        dataIntegrityValid: false,
        error: "Source data exists but target data missing",
      };
    }

    // Validate item count match
    const sourceItemCount = sourceData ? parseItemCount(sourceData) : 0;
    const targetItemCount = targetData ? parseItemCount(targetData) : 0;
    const itemCountMatch = sourceItemCount === targetItemCount;

    // Validate data integrity
    const dataIntegrityValid = itemCountMatch && sourceData === targetData;

    return {
      entityName: "syncQueue",
      sourceKey,
      targetKey,
      sourceExists,
      targetExists,
      itemCountMatch,
      dataIntegrityValid,
      error: !dataIntegrityValid ? "Data integrity check failed" : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      entityName: "syncQueue",
      sourceKey,
      targetKey,
      sourceExists: false,
      targetExists: false,
      itemCountMatch: false,
      dataIntegrityValid: false,
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

// ── Migration Validation Display ───────────────────────────────────────────────

/**
 * Get a human-readable summary of the migration validation report.
 */
export function summarizeMigrationValidation(
  report: MigrationValidationReport,
): string {
  const lines: string[] = [];

  lines.push(`Migration Validation Report`);
  lines.push(`Source: ${report.sourceContext.localOwnerId.slice(0, 8)}...`);
  lines.push(
    `Target: ${report.targetContext.cloudOwnerId ? report.targetContext.cloudOwnerId.slice(0, 8) : "unknown"}...`,
  );
  lines.push(``);

  lines.push(`Results:`);
  for (const result of report.results) {
    if (result.dataIntegrityValid) {
      lines.push(`  ✓ ${result.entityName}: Valid`);
    } else {
      lines.push(`  ✗ ${result.entityName}: ${result.error}`);
    }
  }

  lines.push(``);
  lines.push(`Total entities validated: ${report.totalEntitiesValidated}`);
  lines.push(`Valid entities: ${report.validEntities}`);
  lines.push(`Invalid entities: ${report.invalidEntities}`);
  lines.push(`Overall valid: ${report.overallValid ? "Yes" : "No"}`);

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
 * Check if migration validation passed.
 */
export function isMigrationValid(report: MigrationValidationReport): boolean {
  return report.overallValid;
}

/**
 * Get validation errors.
 */
export function getValidationErrors(
  report: MigrationValidationReport,
): string[] {
  return report.errors;
}
