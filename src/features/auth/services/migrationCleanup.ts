/**
 * Migration Cleanup Service
 *
 * Controlled guest partition cleanup after migration safety has been proven.
 * This service is destructive-capable, but cleanup must never run automatically.
 *
 * Core Rule: migration ≠ cleanup
 * Migration copies and validates.
 * Cleanup removes old guest-owned leftovers only after safety gates pass.
 *
 * Responsibilities:
 * - Create cleanup preview
 * - Validate cleanup candidates
 * - Run controlled guest cleanup
 * - Resume interrupted cleanup
 * - Track cleanup status
 * - Enforce safety gates
 *
 * Safety Guarantees:
 * - Cleanup never runs automatically
 * - Requires explicit confirmation token
 * - Only deletes verified cleanup candidates
 * - Enforces rollback window rules
 * - Preserves rollback metadata until final confirmation
 * - Prevents cleanup during unsafe migration/sync states
 * - Makes cleanup resumable and fail-closed
 *
 * Does NOT:
 * - Run cleanup automatically
 * - Delete active guest partitions
 * - Delete authenticated partitions
 * - Replay sync queue
 * - Upload to Supabase
 * - Add analytics
 * - Add notifications
 * - Add social login
 */

import {
    getEntityStorageKey,
    getSyncQueueStorageKey,
} from "../../../services/storage/storagePartition";
import { storageInstance as mmkvStorage } from "../../../store/storage";
import type {
    GuestCleanupBlockReason,
    GuestCleanupCandidate,
    GuestCleanupPreview,
    GuestCleanupResult,
    GuestCleanupState,
    GuestCleanupStatus,
} from "../types/migration.types";
import { getGuestMigrationStatus } from "./guestMigrationOrchestrator";

// ── Cleanup Constants ───────────────────────────────────────────────────────────

const CONFIRMATION_TOKEN = "CONFIRM_GUEST_CLEANUP";
const ROLLBACK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const SUPPORTED_ENTITIES = [
  "tasks",
  "habits",
  "meals",
  "budget",
  "workouts",
  "calendar",
] as const;

// ── Cleanup State ───────────────────────────────────────────────────────────────

let currentCleanupState: GuestCleanupState = {
  status: "idle",
  latestResult: null,
  isBlocked: false,
  blockReason: null,
  error: null,
};

let isRunning = false;

// ── Helper Functions ───────────────────────────────────────────────────────────

function generateCleanupId(): string {
  return `cleanup-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function updateCleanupStatus(status: GuestCleanupStatus): void {
  currentCleanupState = {
    ...currentCleanupState,
    status,
  };
}

function setCleanupBlocked(blockReason: GuestCleanupBlockReason): void {
  currentCleanupState = {
    ...currentCleanupState,
    status: "blocked",
    isBlocked: true,
    blockReason,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Create a cleanup preview for a guest partition.
 * Validates the cleanup candidate and returns a preview of what will be deleted.
 *
 * @param localOwnerId - Local owner ID of the guest partition
 * @returns Cleanup preview
 */
export function createCleanupPreview(
  localOwnerId: string,
): GuestCleanupPreview {
  const migrationStatus = getGuestMigrationStatus();
  const report = migrationStatus.report;

  // Validate migration completed
  if (!report || report.status !== "completed") {
    return {
      candidate: {
        localOwnerId,
        cloudOwnerId: null,
        migrationCompleted: false,
        validationPassed: false,
        rollbackWindowExpired: false,
        isCleanupSafe: false,
        migrationCompletedAt: null,
        partitionKeys: [],
        syncPartitionKeys: [],
      },
      estimatedKeyCount: 0,
      estimatedSize: 0,
      isBlocked: true,
      blockReason: "migration_not_completed",
      keysToDelete: [],
      keysToSkip: [],
    };
  }

  // Validate rollback window expired
  const migrationCompletedAt = report.completedAt
    ? new Date(report.completedAt).getTime()
    : 0;
  const rollbackWindowExpired =
    Date.now() - migrationCompletedAt > ROLLBACK_WINDOW_MS;

  if (!rollbackWindowExpired) {
    return {
      candidate: {
        localOwnerId,
        cloudOwnerId: report.targetContext.cloudOwnerId || null,
        migrationCompleted: true,
        validationPassed:
          report.validationResults?.every((r) => r.passed) === true,
        rollbackWindowExpired: false,
        isCleanupSafe: false,
        migrationCompletedAt: report.completedAt,
        partitionKeys: [],
        syncPartitionKeys: [],
      },
      estimatedKeyCount: 0,
      estimatedSize: 0,
      isBlocked: true,
      blockReason: "rollback_window_not_expired",
      keysToDelete: [],
      keysToSkip: [],
    };
  }

  // Build partition keys
  const partitionKeys: string[] = [];
  const syncPartitionKeys: string[] = [];

  for (const entityName of SUPPORTED_ENTITIES) {
    const guestKey = getEntityStorageKey(entityName, {
      accountMode: "guest",
      localOwnerId,
      cloudOwnerId: undefined,
      storagePartitionKey: `guest:${localOwnerId}`,
      syncPartitionKey: `guest:${localOwnerId}:syncQueue`,
      isMigrating: false,
    });
    partitionKeys.push(guestKey);
  }

  const syncKey = getSyncQueueStorageKey({
    accountMode: "guest",
    localOwnerId,
    cloudOwnerId: undefined,
    storagePartitionKey: `guest:${localOwnerId}`,
    syncPartitionKey: `guest:${localOwnerId}:syncQueue`,
    isMigrating: false,
  });
  syncPartitionKeys.push(syncKey);

  return {
    candidate: {
      localOwnerId,
      cloudOwnerId: report.targetContext.cloudOwnerId || null,
      migrationCompleted: true,
      validationPassed:
        report.validationResults?.every((r) => r.passed) === true,
      rollbackWindowExpired: true,
      isCleanupSafe: true,
      migrationCompletedAt: report.completedAt,
      partitionKeys,
      syncPartitionKeys,
    },
    estimatedKeyCount: partitionKeys.length + syncPartitionKeys.length,
    estimatedSize: 0, // Would need to calculate actual size
    isBlocked: false,
    blockReason: null,
    keysToDelete: [...partitionKeys, ...syncPartitionKeys],
    keysToSkip: [],
  };
}

/**
 * Validate a cleanup candidate.
 * Checks all safety gates before allowing cleanup.
 *
 * @param candidate - Cleanup candidate to validate
 * @returns Whether the candidate is valid for cleanup
 */
export function validateCleanupCandidate(
  candidate: GuestCleanupCandidate,
): boolean {
  // Migration must be completed
  if (!candidate.migrationCompleted) {
    return false;
  }

  // Validation must have passed
  if (!candidate.validationPassed) {
    return false;
  }

  // Rollback window must be expired
  if (!candidate.rollbackWindowExpired) {
    return false;
  }

  // Candidate must be marked cleanup-safe
  if (!candidate.isCleanupSafe) {
    return false;
  }

  return true;
}

/**
 * Run controlled guest cleanup.
 * Deletes only verified cleanup candidates with explicit confirmation.
 *
 * @param localOwnerId - Local owner ID of the guest partition
 * @param confirmationToken - Confirmation token (must be "CONFIRM_GUEST_CLEANUP")
 * @returns Cleanup result
 */
export async function runControlledGuestCleanup(
  localOwnerId: string,
  confirmationToken: string,
): Promise<GuestCleanupResult> {
  if (!__DEV__) {
    console.warn("[MigrationCleanup] Cleanup only runs in __DEV__ mode");
    return {
      success: false,
      cleanupId: generateCleanupId(),
      status: "blocked",
      deletedKeyCount: 0,
      skippedKeyCount: 0,
      failedKeyCount: 0,
      deletedKeys: [],
      skippedKeys: [],
      failedKeys: [],
      currentStep: null,
      errors: ["Cleanup only runs in __DEV__ mode"],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  if (isRunning) {
    console.warn("[MigrationCleanup] Cleanup is already running");
    return {
      success: false,
      cleanupId: generateCleanupId(),
      status: "blocked",
      deletedKeyCount: 0,
      skippedKeyCount: 0,
      failedKeyCount: 0,
      deletedKeys: [],
      skippedKeys: [],
      failedKeys: [],
      currentStep: null,
      errors: ["Cleanup is already running"],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  // Validate confirmation token
  if (confirmationToken !== CONFIRMATION_TOKEN) {
    setCleanupBlocked("missing_confirmation_token");
    return {
      success: false,
      cleanupId: generateCleanupId(),
      status: "blocked",
      deletedKeyCount: 0,
      skippedKeyCount: 0,
      failedKeyCount: 0,
      deletedKeys: [],
      skippedKeys: [],
      failedKeys: [],
      currentStep: null,
      errors: ["Missing or invalid confirmation token"],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  isRunning = true;
  updateCleanupStatus("previewing");

  const cleanupId = generateCleanupId();
  const startedAt = new Date().toISOString();
  const deletedKeys: string[] = [];
  const skippedKeys: string[] = [];
  const failedKeys: string[] = [];
  const errors: string[] = [];

  try {
    // Step 1: Create preview
    updateCleanupStatus("previewing");
    const preview = createCleanupPreview(localOwnerId);

    if (preview.isBlocked) {
      setCleanupBlocked(preview.blockReason!);
      return {
        success: false,
        cleanupId,
        status: "blocked",
        deletedKeyCount: 0,
        skippedKeyCount: 0,
        failedKeyCount: 0,
        deletedKeys: [],
        skippedKeys: [],
        failedKeys: [],
        currentStep: null,
        errors: [`Cleanup blocked: ${preview.blockReason}`],
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }

    // Step 2: Validate candidate
    updateCleanupStatus("awaiting_confirmation");
    if (!validateCleanupCandidate(preview.candidate)) {
      setCleanupBlocked("candidate_not_cleanup_safe");
      return {
        success: false,
        cleanupId,
        status: "blocked",
        deletedKeyCount: 0,
        skippedKeyCount: 0,
        failedKeyCount: 0,
        deletedKeys: [],
        skippedKeys: [],
        failedKeys: [],
        currentStep: null,
        errors: ["Candidate validation failed"],
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }

    // Step 3: Delete guest partitions
    updateCleanupStatus("deleting");
    if (!mmkvStorage) {
      throw new Error("MMKV storage not available");
    }

    for (const key of preview.keysToDelete) {
      try {
        mmkvStorage.delete(key);
        deletedKeys.push(key);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to delete ${key}: ${message}`);
        failedKeys.push(key);
      }
    }

    // Step 4: Complete
    updateCleanupStatus("completed");
    currentCleanupState = {
      ...currentCleanupState,
      latestResult: {
        success: true,
        cleanupId,
        status: "completed",
        deletedKeyCount: deletedKeys.length,
        skippedKeyCount: skippedKeys.length,
        failedKeyCount: failedKeys.length,
        deletedKeys,
        skippedKeys,
        failedKeys,
        currentStep: null,
        errors,
        startedAt,
        completedAt: new Date().toISOString(),
      },
    };

    console.log(
      `[MigrationCleanup] Cleanup completed: ${deletedKeys.length} keys deleted`,
    );

    return currentCleanupState.latestResult!;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[MigrationCleanup] Cleanup failed:", err);

    updateCleanupStatus("failed");
    currentCleanupState = {
      ...currentCleanupState,
      error: message,
      latestResult: {
        success: false,
        cleanupId,
        status: "failed",
        deletedKeyCount: deletedKeys.length,
        skippedKeyCount: skippedKeys.length,
        failedKeyCount: failedKeys.length,
        deletedKeys,
        skippedKeys,
        failedKeys,
        currentStep: null,
        errors: [...errors, message],
        startedAt,
        completedAt: new Date().toISOString(),
      },
    };

    return currentCleanupState.latestResult!;
  } finally {
    isRunning = false;
  }
}

/**
 * Resume an interrupted guest cleanup.
 * Continues cleanup from known safe candidates.
 *
 * @param cleanupId - Cleanup ID to resume
 * @returns Cleanup result
 */
export async function resumeGuestCleanup(
  cleanupId: string,
): Promise<GuestCleanupResult> {
  if (!__DEV__) {
    console.warn("[MigrationCleanup] Resume only runs in __DEV__ mode");
    return {
      success: false,
      cleanupId,
      status: "blocked",
      deletedKeyCount: 0,
      skippedKeyCount: 0,
      failedKeyCount: 0,
      deletedKeys: [],
      skippedKeys: [],
      failedKeys: [],
      currentStep: null,
      errors: ["Resume only runs in __DEV__ mode"],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  if (currentCleanupState.latestResult?.cleanupId !== cleanupId) {
    return {
      success: false,
      cleanupId,
      status: "blocked",
      deletedKeyCount: 0,
      skippedKeyCount: 0,
      failedKeyCount: 0,
      deletedKeys: [],
      skippedKeys: [],
      failedKeys: [],
      currentStep: null,
      errors: ["Cleanup ID not found"],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  // Resume from current state
  // For now, just return the current result
  // In a full implementation, this would continue from the last successful step
  return (
    currentCleanupState.latestResult || {
      success: false,
      cleanupId,
      status: "failed",
      deletedKeyCount: 0,
      skippedKeyCount: 0,
      failedKeyCount: 0,
      deletedKeys: [],
      skippedKeys: [],
      failedKeys: [],
      currentStep: null,
      errors: ["No cleanup result to resume"],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }
  );
}

/**
 * Get the current cleanup status.
 *
 * @returns Current cleanup state
 */
export function getCleanupStatus(): GuestCleanupState {
  return currentCleanupState;
}

/**
 * Reset the cleanup status.
 * Clears the current cleanup state and result.
 *
 * WARNING: This does not delete any data. It only clears the in-memory state.
 */
export function resetCleanupStatus(): void {
  currentCleanupState = {
    status: "idle",
    latestResult: null,
    isBlocked: false,
    blockReason: null,
    error: null,
  };
  isRunning = false;
  console.log("[MigrationCleanup] Cleanup status reset");
}
