/**
 * Migration Test Harness Types
 *
 * Development-only types for testing guest → account migration safety.
 * These types are only used in __DEV__ mode for testing purposes.
 *
 * Purpose:
 * - Provide structured test harness reporting
 * - Track test harness state
 * - Validate migration safety pass behavior
 * - No production usage
 */

import type { RepositoryContext } from "./auth.types";
import type { GuestMigrationSafetyReport } from "./migration.types";

// ── Test Harness Status ───────────────────────────────────────────────────────────

export type MigrationHarnessStatus =
  | "idle"
  | "seeding_data"
  | "running_safety_pass"
  | "validating_results"
  | "completed"
  | "failed";

// ── Test Harness Step Result ───────────────────────────────────────────────────────

export interface MigrationHarnessStepResult {
  step: string;
  success: boolean;
  duration: number; // in milliseconds
  error?: string;
  details?: Record<string, unknown>;
}

// ── Test Harness Report ─────────────────────────────────────────────────────────────

export interface MigrationHarnessReport {
  status: MigrationHarnessStatus;
  startedAt: string;
  completedAt: string | null;
  testContext: {
    localOwnerId: string;
    cloudOwnerId: string;
  };
  steps: MigrationHarnessStepResult[];
  safetyPassReport: GuestMigrationSafetyReport | null;
  validationResults: {
    guestSourcePartitionsExist: boolean;
    targetPartitionsCopied: boolean;
    rollbackSnapshotCreated: boolean;
    syncTransferPrepared: boolean;
    orphanTrackingRecordExists: boolean;
    guestDataUntouched: boolean;
  };
  error: string | null;
}

// ── Test Harness Result ───────────────────────────────────────────────────────────

export interface MigrationHarnessResult {
  success: boolean;
  report: MigrationHarnessReport;
  summary: string;
}
