/**
 * Guest Migration Types
 *
 * Type definitions for guest → account migration safety orchestration.
 * Defines migration steps, statuses, reports, and results.
 */

import type { RepositoryContext } from "./auth.types";

// ── Migration Steps ─────────────────────────────────────────────────────────────

/**
 * Individual steps in the guest migration safety pass.
 * Each step represents a phase of the migration process.
 */
export type GuestMigrationStep =
  | "previewing"
  | "checking_conflicts"
  | "copying"
  | "validating"
  | "preparing_rollback"
  | "preparing_sync_transfer"
  | "tracking_orphaned_guest"
  | "completed"
  | "failed";

/**
 * Status of an individual migration step.
 */
export type GuestMigrationStepStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "skipped";

// ── Migration Status ─────────────────────────────────────────────────────────────

/**
 * Overall status of the guest migration process.
 */
export type GuestMigrationStatus =
  | "idle"
  | "previewing"
  | "checking_conflicts"
  | "copying"
  | "validating"
  | "preparing_rollback"
  | "preparing_sync_transfer"
  | "tracking_orphaned_guest"
  | "completed"
  | "failed";

/**
 * Reasons for migration failure.
 */
export type GuestMigrationFailureReason =
  | "preview_failed"
  | "conflict_detection_failed"
  | "copy_failed"
  | "validation_failed"
  | "rollback_preparation_failed"
  | "sync_transfer_preparation_failed"
  | "tracking_failed"
  | "unknown_error";

// ── Migration Report ────────────────────────────────────────────────────────────

/**
 * Detailed report of a migration safety pass.
 * Contains step-by-step results and metadata.
 */
export interface GuestMigrationSafetyReport {
  /** Unique identifier for this migration pass */
  migrationId: string;
  /** Timestamp when migration started */
  startedAt: string;
  /** Timestamp when migration completed (null if in progress) */
  completedAt: string | null;
  /** Current overall status */
  status: GuestMigrationStatus;
  /** Source guest context */
  sourceContext: RepositoryContext;
  /** Target authenticated context */
  targetContext: RepositoryContext;
  /** Status of each migration step */
  stepStatuses: Record<GuestMigrationStep, GuestMigrationStepStatus>;
  /** Error message if migration failed */
  error: string | null;
  /** Failure reason if migration failed */
  failureReason: GuestMigrationFailureReason | null;
  /** Preview data from migration preview step */
  preview: MigrationPreviewData | null;
  /** Conflict resolution results */
  conflicts: ConflictResolutionResult[] | null;
  /** Copy operation results */
  copyResults: CopyOperationResult[] | null;
  /** Validation results */
  validationResults: ValidationResult[] | null;
  /** Rollback snapshot metadata */
  rollbackSnapshot: RollbackSnapshotMetadata | null;
  /** Sync queue transfer preview */
  syncTransferPreview: SyncQueueTransferPreviewData | null;
  /** Orphaned guest tracking data */
  orphanedGuestTracking: OrphanedGuestTrackingData | null;
}

/**
 * Preview data from migration preview step.
 */
export interface MigrationPreviewData {
  /** Entities found in guest partitions */
  entities: string[];
  /** Total data size in bytes */
  totalSize: number;
  /** Total item count */
  itemCount: number;
  /** Potential conflicts detected */
  potentialConflicts: string[];
}

/**
 * Result of a conflict resolution.
 */
export interface ConflictResolutionResult {
  /** Entity name */
  entityName: string;
  /** Conflict resolution strategy used */
  strategy: string;
  /** Whether resolution was successful */
  success: boolean;
}

/**
 * Result of a copy operation.
 */
export interface CopyOperationResult {
  /** Entity name */
  entityName: string;
  /** Source key */
  sourceKey: string;
  /** Target key */
  targetKey: string;
  /** Whether copy was successful */
  success: boolean;
  /** Bytes copied */
  bytesCopied: number;
  /** Items copied */
  itemsCopied: number;
}

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  /** Entity name */
  entityName: string;
  /** Source key */
  sourceKey: string;
  /** Target key */
  targetKey: string;
  /** Whether validation passed */
  passed: boolean;
  /** Error message if validation failed */
  error: string | null;
}

/**
 * Metadata for a rollback snapshot.
 */
export interface RollbackSnapshotMetadata {
  /** Snapshot ID */
  snapshotId: string;
  /** Timestamp when snapshot was created */
  createdAt: string;
  /** Whether snapshot is available for rollback */
  isAvailable: boolean;
}

/**
 * Preview data for sync queue transfer.
 */
export interface SyncQueueTransferPreviewData {
  /** Number of items to transfer */
  itemsToTransfer: number;
  /** Whether transfer preparation was successful */
  success: boolean;
}

/**
 * Data for orphaned guest tracking.
 */
export interface OrphanedGuestTrackingData {
  /** Guest partition status */
  status: string;
  /** Whether tracking was successful */
  success: boolean;
}

// ── Migration Result ─────────────────────────────────────────────────────────────

/**
 * Result of a migration safety pass.
 */
export interface GuestMigrationSafetyResult {
  /** Whether the safety pass was successful */
  success: boolean;
  /** Detailed safety report */
  report: GuestMigrationSafetyReport;
  /** Whether rollback is available */
  rollbackAvailable: boolean;
  /** Whether cleanup is eligible */
  cleanupEligible: boolean;
}

// ── Migration State ────────────────────────────────────────────────────────────

/**
 * Current state of guest migration.
 * Used by the migration status hook.
 */
export interface GuestMigrationState {
  /** Current migration status */
  status: GuestMigrationStatus;
  /** Latest safety report (null if no migration has run) */
  latestReport: GuestMigrationSafetyReport | null;
  /** Whether rollback is available */
  rollbackAvailable: boolean;
  /** Whether cleanup is eligible */
  cleanupEligible: boolean;
  /** Error message if migration failed */
  error: string | null;
}

// ── Cleanup Types ───────────────────────────────────────────────────────────────

/**
 * Status of guest cleanup process.
 */
export type GuestCleanupStatus =
  | "idle"
  | "previewing"
  | "awaiting_confirmation"
  | "deleting"
  | "paused"
  | "completed"
  | "failed"
  | "blocked";

/**
 * Steps in the guest cleanup process.
 */
export type GuestCleanupStep =
  | "validating_candidate"
  | "checking_rollback_window"
  | "checking_sync_transfer"
  | "deleting_guest_partitions"
  | "deleting_sync_partitions"
  | "deleting_orphaned_partitions"
  | "cleanup_rollback_metadata"
  | "completed"
  | "failed";

/**
 * Reasons for cleanup being blocked.
 */
export type GuestCleanupBlockReason =
  | "migration_not_completed"
  | "validation_not_passed"
  | "rollback_window_not_expired"
  | "pending_sync_transfer"
  | "active_guest_ownership"
  | "candidate_not_cleanup_safe"
  | "missing_confirmation_token"
  | "unknown_owner"
  | "storage_key_mismatch"
  | "rollback_snapshot_missing";

/**
 * Preview of guest cleanup operation.
 */
export interface GuestCleanupPreview {
  /** Cleanup candidate information */
  candidate: GuestCleanupCandidate;
  /** Estimated number of keys to delete */
  estimatedKeyCount: number;
  /** Estimated size of data to delete in bytes */
  estimatedSize: number;
  /** Whether cleanup is blocked */
  isBlocked: boolean;
  /** Reason if blocked */
  blockReason: GuestCleanupBlockReason | null;
  /** Keys that will be deleted */
  keysToDelete: string[];
  /** Keys that will be skipped */
  keysToSkip: string[];
}

/**
 * A guest partition candidate for cleanup.
 */
export interface GuestCleanupCandidate {
  /** Local owner ID of the guest partition */
  localOwnerId: string;
  /** Cloud owner ID if migrated */
  cloudOwnerId: string | null;
  /** Whether migration was completed */
  migrationCompleted: boolean;
  /** Whether validation passed */
  validationPassed: boolean;
  /** Whether rollback window has expired */
  rollbackWindowExpired: boolean;
  /** Whether candidate is marked cleanup-safe */
  isCleanupSafe: boolean;
  /** Timestamp when migration completed */
  migrationCompletedAt: string | null;
  /** Partition keys to delete */
  partitionKeys: string[];
  /** Sync partition keys to delete */
  syncPartitionKeys: string[];
}

/**
 * Result of a guest cleanup operation.
 */
export interface GuestCleanupResult {
  /** Whether cleanup was successful */
  success: boolean;
  /** Cleanup ID */
  cleanupId: string;
  /** Status of cleanup */
  status: GuestCleanupStatus;
  /** Number of keys deleted */
  deletedKeyCount: number;
  /** Number of keys skipped */
  skippedKeyCount: number;
  /** Number of keys that failed to delete */
  failedKeyCount: number;
  /** Keys that were deleted */
  deletedKeys: string[];
  /** Keys that were skipped */
  skippedKeys: string[];
  /** Keys that failed to delete */
  failedKeys: string[];
  /** Current step if paused */
  currentStep: GuestCleanupStep | null;
  /** Errors encountered */
  errors: string[];
  /** Timestamp when cleanup started */
  startedAt: string;
  /** Timestamp when cleanup completed (null if not completed) */
  completedAt: string | null;
}

/**
 * Error during guest cleanup.
 */
export interface GuestCleanupError {
  /** Step where error occurred */
  step: GuestCleanupStep;
  /** Error message */
  message: string;
  /** Key that caused error (if applicable) */
  key: string | null;
  /** Timestamp */
  timestamp: string;
}

/**
 * Current status of guest cleanup.
 */
export interface GuestCleanupState {
  /** Current cleanup status */
  status: GuestCleanupStatus;
  /** Current cleanup result (null if no cleanup has run) */
  latestResult: GuestCleanupResult | null;
  /** Whether cleanup is blocked */
  isBlocked: boolean;
  /** Block reason if blocked */
  blockReason: GuestCleanupBlockReason | null;
  /** Error message if cleanup failed */
  error: string | null;
}
