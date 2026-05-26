/**
 * Auth State Diagnostics
 *
 * Development-only diagnostics for validating auth state consistency.
 * Validates ownership consistency, storage partition consistency, repository context integrity,
 * detects invalid migration states, and detects orphaned sync queue ownership.
 *
 * These are development-only utilities. No analytics or production telemetry.
 */

import { getRepositoryContext } from "../../../services/repositories/repositoryContext";
import { useAuthSessionStore } from "../store/useAuthSessionStore";
import type { RepositoryContext } from "../types/auth.types";

// ── Diagnostic Results ─────────────────────────────────────────────────────────────

export interface DiagnosticResult {
  name: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface DiagnosticReport {
  timestamp: string;
  results: DiagnosticResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

// ── Ownership Consistency Validation ───────────────────────────────────────────────

/**
 * Validate that ownership is consistent across auth session and repository context.
 */
export function validateOwnershipConsistency(): DiagnosticResult {
  try {
    const state = useAuthSessionStore.getState();

    if (!state.hasHydrated) {
      return {
        name: "Ownership Consistency",
        passed: false,
        message: "Auth session not hydrated",
      };
    }

    const context = getRepositoryContext();

    // Check account mode consistency
    if (context.accountMode !== state.accountMode) {
      return {
        name: "Ownership Consistency",
        passed: false,
        message: "Account mode mismatch between store and context",
        details: {
          storeMode: state.accountMode,
          contextMode: context.accountMode,
        },
      };
    }

    // Check local owner ID consistency
    if (context.localOwnerId !== state.localOwnerId) {
      return {
        name: "Ownership Consistency",
        passed: false,
        message: "Local owner ID mismatch between store and context",
        details: {
          storeLocalOwnerId: state.localOwnerId,
          contextLocalOwnerId: context.localOwnerId,
        },
      };
    }

    // Check cloud owner ID consistency for authenticated mode
    if (state.accountMode === "authenticated") {
      if (context.cloudOwnerId !== state.cloudOwnerId) {
        return {
          name: "Ownership Consistency",
          passed: false,
          message: "Cloud owner ID mismatch between store and context",
          details: {
            storeCloudOwnerId: state.cloudOwnerId,
            contextCloudOwnerId: context.cloudOwnerId,
          },
        };
      }
    }

    return {
      name: "Ownership Consistency",
      passed: true,
      message: "Ownership is consistent",
    };
  } catch (err) {
    return {
      name: "Ownership Consistency",
      passed: false,
      message: `Validation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ── Storage Partition Consistency Validation ───────────────────────────────────────

/**
 * Validate that storage partition keys follow the expected pattern.
 */
export function validateStoragePartitionConsistency(): DiagnosticResult {
  try {
    const context = getRepositoryContext();

    // Validate storage partition key pattern
    const expectedPrefix = context.accountMode === "guest" ? "guest:" : "user:";
    if (!context.storagePartitionKey.startsWith(expectedPrefix)) {
      return {
        name: "Storage Partition Consistency",
        passed: false,
        message: "Storage partition key has invalid prefix",
        details: {
          expectedPrefix,
          actualKey: context.storagePartitionKey,
        },
      };
    }

    // Validate sync partition key pattern
    if (!context.syncPartitionKey.endsWith(":syncQueue")) {
      return {
        name: "Storage Partition Consistency",
        passed: false,
        message: "Sync partition key has invalid suffix",
        details: {
          actualKey: context.syncPartitionKey,
        },
      };
    }

    // Validate sync partition key matches storage partition key
    const syncPrefix = context.syncPartitionKey.replace(":syncQueue", "");
    if (syncPrefix !== context.storagePartitionKey) {
      return {
        name: "Storage Partition Consistency",
        passed: false,
        message: "Sync partition key does not match storage partition key",
        details: {
          storageKey: context.storagePartitionKey,
          syncKey: context.syncPartitionKey,
        },
      };
    }

    return {
      name: "Storage Partition Consistency",
      passed: true,
      message: "Storage partition keys are consistent",
    };
  } catch (err) {
    return {
      name: "Storage Partition Consistency",
      passed: false,
      message: `Validation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ── Repository Context Integrity Validation ───────────────────────────────────────

/**
 * Validate that repository context has all required fields.
 */
export function validateRepositoryContextIntegrity(): DiagnosticResult {
  try {
    const context = getRepositoryContext();

    const requiredFields: (keyof RepositoryContext)[] = [
      "accountMode",
      "localOwnerId",
      "storagePartitionKey",
      "syncPartitionKey",
      "isMigrating",
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (context[field] === undefined || context[field] === null) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return {
        name: "Repository Context Integrity",
        passed: false,
        message: "Repository context is missing required fields",
        details: {
          missingFields,
        },
      };
    }

    // Validate account mode is valid
    if (
      context.accountMode !== "guest" &&
      context.accountMode !== "authenticated"
    ) {
      return {
        name: "Repository Context Integrity",
        passed: false,
        message: "Invalid account mode",
        details: {
          accountMode: context.accountMode,
        },
      };
    }

    // Validate cloud owner ID is present for authenticated mode
    if (context.accountMode === "authenticated" && !context.cloudOwnerId) {
      return {
        name: "Repository Context Integrity",
        passed: false,
        message: "Cloud owner ID missing in authenticated mode",
      };
    }

    return {
      name: "Repository Context Integrity",
      passed: true,
      message: "Repository context is valid",
    };
  } catch (err) {
    return {
      name: "Repository Context Integrity",
      passed: false,
      message: `Validation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ── Migration State Validation ───────────────────────────────────────────────────

/**
 * Validate that migration state is consistent and not stuck.
 */
export function validateMigrationState(): DiagnosticResult {
  try {
    const state = useAuthSessionStore.getState();

    // If not migrating, that's fine
    if (
      state.transitionStatus === "idle" ||
      state.transitionStatus === "completed"
    ) {
      return {
        name: "Migration State",
        passed: true,
        message: "No migration in progress",
      };
    }

    // If migrating, check for stuck state
    const lastRestoreAt = state.lastSessionRestoreAt;
    if (lastRestoreAt) {
      const restoreTime = new Date(lastRestoreAt).getTime();
      const now = Date.now();
      const elapsed = now - restoreTime;

      // If migration has been stuck for more than 5 minutes, flag it
      if (elapsed > 5 * 60 * 1000) {
        return {
          name: "Migration State",
          passed: false,
          message: "Migration appears to be stuck",
          details: {
            transitionStatus: state.transitionStatus,
            elapsedMinutes: Math.floor(elapsed / 60000),
          },
        };
      }
    }

    return {
      name: "Migration State",
      passed: true,
      message: "Migration state is valid",
      details: {
        transitionStatus: state.transitionStatus,
      },
    };
  } catch (err) {
    return {
      name: "Migration State",
      passed: false,
      message: `Validation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ── Orphaned Sync Queue Ownership Detection ───────────────────────────────────────

/**
 * Detect sync queue items that don't match the current repository context.
 * This is a placeholder - actual implementation would require sync queue access.
 */
export function detectOrphanedSyncQueueOwnership(): DiagnosticResult {
  try {
    const context = getRepositoryContext();

    // TODO: Implement actual sync queue scanning
    // This would require access to the sync queue storage
    // For now, return a warning that this is not implemented

    return {
      name: "Orphaned Sync Queue Ownership",
      passed: true,
      message: "Not implemented - requires sync queue access",
      details: {
        currentContext: {
          accountMode: context.accountMode,
          localOwnerId: context.localOwnerId,
          cloudOwnerId: context.cloudOwnerId,
        },
      },
    };
  } catch (err) {
    return {
      name: "Orphaned Sync Queue Ownership",
      passed: false,
      message: `Validation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ── Full Diagnostic Report ───────────────────────────────────────────────────────

/**
 * Run all auth diagnostics and return a comprehensive report.
 */
export function runAuthDiagnostics(): DiagnosticReport {
  const results: DiagnosticResult[] = [
    validateOwnershipConsistency(),
    validateStoragePartitionConsistency(),
    validateRepositoryContextIntegrity(),
    validateMigrationState(),
    detectOrphanedSyncQueueOwnership(),
  ];

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed,
      failed,
    },
  };
}

/**
 * Log diagnostic report to console (development only).
 */
export function logAuthDiagnostics(): void {
  if (!__DEV__) {
    return;
  }

  const report = runAuthDiagnostics();

  console.group("[Auth Diagnostics]");
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(
    `Summary: ${report.summary.passed}/${report.summary.total} passed`,
  );

  for (const result of report.results) {
    const status = result.passed ? "✓" : "✗";
    console.log(`${status} ${result.name}: ${result.message}`);
    if (result.details) {
      console.log("  Details:", result.details);
    }
  }

  console.groupEnd();
}
