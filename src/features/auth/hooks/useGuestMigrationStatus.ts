/**
 * Guest Migration Status Hook
 *
 * Hook for reading current guest migration status.
 * Exposes migration state, safety report, and safe action methods.
 *
 * Responsibilities:
 * - Read current migration status
 * - Expose latest safety report
 * - Expose whether rollback is available
 * - Expose whether cleanup is eligible
 * - Expose safe action methods
 *
 * Does NOT:
 * - Run migration automatically
 * - Perform destructive actions
 * - Delete guest data
 * - Replay sync queue
 * - UI-specific logic
 */

import { useMemo } from "react";
import {
  getGuestMigrationStatus,
  prepareGuestMigrationRollback,
  validateGuestMigrationSafetyPass,
  resetGuestMigrationSafetyState,
} from "../services/guestMigrationOrchestrator";
import type {
  GuestMigrationState,
  GuestMigrationStatus,
} from "../types/migration.types";

/**
 * Hook to read guest migration status.
 *
 * @returns Current migration state and safe action methods
 */
export function useGuestMigrationStatus(): GuestMigrationState & {
  /** Prepare rollback for the current migration */
  prepareRollback: (migrationId: string) => boolean;
  /** Validate the current migration */
  validateMigration: (migrationId: string) => boolean;
  /** Reset migration state (clears in-memory state only) */
  resetState: () => void;
} {
  const migrationStatus = getGuestMigrationStatus();

  const state: GuestMigrationState = useMemo(() => ({
    status: migrationStatus.status,
    latestReport: migrationStatus.report,
    rollbackAvailable: migrationStatus.report?.rollbackSnapshot?.isAvailable === true,
    cleanupEligible: false, // Cleanup is deferred to future phase
    error: migrationStatus.report?.error || null,
  }), [migrationStatus]);

  const prepareRollback = (migrationId: string): boolean => {
    return prepareGuestMigrationRollback(migrationId);
  };

  const validateMigration = (migrationId: string): boolean => {
    return validateGuestMigrationSafetyPass(migrationId);
  };

  const resetState = (): void => {
    resetGuestMigrationSafetyState();
  };

  return {
    ...state,
    prepareRollback,
    validateMigration,
    resetState,
  };
}

/**
 * Hook to check if migration is currently running.
 *
 * @returns Whether migration is in progress
 */
export function useIsMigrationRunning(): boolean {
  const migrationStatus = getGuestMigrationStatus();
  return migrationStatus.isRunning;
}

/**
 * Hook to get current migration status.
 *
 * @returns Current migration status
 */
export function useMigrationStatus(): GuestMigrationStatus {
  const migrationStatus = getGuestMigrationStatus();
  return migrationStatus.status;
}
