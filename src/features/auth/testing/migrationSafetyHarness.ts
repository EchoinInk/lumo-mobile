/**
 * Migration Safety Test Harness
 *
 * Development-only test harness for proving the guest → account migration safety pass
 * works with disposable local data before destructive cleanup is introduced.
 *
 * Purpose:
 * - Seed mock guest data
 * - Run migration safety pass manually
 * - Verify copied authenticated partitions
 * - Verify validation reports
 * - Verify rollback snapshot creation
 * - Verify sync queue transfer preparation
 * - Verify orphaned guest tracking
 * - Confirm guest data remains untouched
 * - Confirm no destructive cleanup occurs
 *
 * Rules:
 * - Only run in __DEV__ mode
 * - Never run automatically
 * - Never touch real active user partitions unless explicitly passed test context
 * - No destructive cleanup
 * - No sync replay
 * - No Supabase upload
 */

import { getEntityStorageKey, getSyncQueueStorageKey } from "../../../services/storage/storagePartition";
import { storageInstance as mmkvStorage } from "../../../store/storage";
import { runGuestMigrationSafetyPass, resetGuestMigrationSafetyState } from "../services/guestMigrationOrchestrator";
import {
  clearMockMigrationTestData,
  getMockMigrationContexts,
  seedMockGuestMigrationData,
  seedMockGuestSyncQueue,
  verifyMockGuestDataExists,
  verifyMockSyncQueueExists,
} from "./migrationTestData";
import type {
  MigrationHarnessReport,
  MigrationHarnessResult,
  MigrationHarnessStatus,
  MigrationHarnessStepResult,
} from "../types/migrationTest.types";

// ── Harness State ─────────────────────────────────────────────────────────────

let currentReport: MigrationHarnessReport | null = null;
let isRunning = false;

// ── Helper Functions ───────────────────────────────────────────────────────────

function createStepResult(
  step: string,
  success: boolean,
  duration: number,
  error?: string,
  details?: Record<string, unknown>,
): MigrationHarnessStepResult {
  return {
    step,
    success,
    duration,
    error,
    details,
  };
}

function initializeHarnessReport(): MigrationHarnessReport {
  const { guestContext, authenticatedContext } = getMockMigrationContexts();
  return {
    status: "idle",
    startedAt: new Date().toISOString(),
    completedAt: null,
    testContext: {
      localOwnerId: guestContext.localOwnerId,
      cloudOwnerId: authenticatedContext.cloudOwnerId || "",
    },
    steps: [],
    safetyPassReport: null,
    validationResults: {
      guestSourcePartitionsExist: false,
      targetPartitionsCopied: false,
      rollbackSnapshotCreated: false,
      syncTransferPrepared: false,
      orphanTrackingRecordExists: false,
      guestDataUntouched: false,
    },
    error: null,
  };
}

function updateHarnessStatus(
  report: MigrationHarnessReport,
  status: MigrationHarnessStatus,
): MigrationHarnessReport {
  return {
    ...report,
    status,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Run the migration safety test harness.
 *
 * Flow:
 * 1. Seed guest data
 * 2. Seed guest sync queue
 * 3. Create guest/auth repository contexts
 * 4. Run migration safety pass
 * 5. Validate target partitions
 * 6. Verify rollback snapshot exists
 * 7. Verify sync transfer report exists
 * 8. Verify guest source partitions still exist
 * 9. Return structured test report
 *
 * @returns Test harness result with report
 */
export async function runMigrationSafetyHarness(): Promise<MigrationHarnessResult> {
  if (!__DEV__) {
    console.warn("[MigrationSafetyHarness] Harness only runs in __DEV__ mode");
    return {
      success: false,
      report: initializeHarnessReport(),
      summary: "Harness only runs in __DEV__ mode",
    };
  }

  if (isRunning) {
    console.warn("[MigrationSafetyHarness] Harness is already running");
    return {
      success: false,
      report: currentReport || initializeHarnessReport(),
      summary: "Harness is already running",
    };
  }

  isRunning = true;
  const startTime = Date.now();

  let report = initializeHarnessReport();
  const steps: MigrationHarnessStepResult[] = [];

  try {
    // Step 1: Seed guest data
    report = updateHarnessStatus(report, "seeding_data");
    const seedStart = Date.now();
    seedMockGuestMigrationData();
    seedMockGuestSyncQueue();
    steps.push(
      createStepResult("seed_guest_data", true, Date.now() - seedStart),
    );

    // Step 2: Verify seeded data
    const guestDataExists = verifyMockGuestDataExists();
    const syncQueueExists = verifyMockSyncQueueExists();
    if (!guestDataExists || !syncQueueExists) {
      throw new Error("Failed to seed mock guest data or sync queue");
    }

    // Step 3: Get test contexts
    const { guestContext, authenticatedContext } = getMockMigrationContexts();

    // Step 4: Run safety pass
    report = updateHarnessStatus(report, "running_safety_pass");
    const safetyPassStart = Date.now();
    const safetyPassResult = await runGuestMigrationSafetyPass(
      guestContext,
      authenticatedContext,
    );
    steps.push(
      createStepResult(
        "run_safety_pass",
        safetyPassResult.success,
        Date.now() - safetyPassStart,
        safetyPassResult.success ? undefined : "Safety pass failed",
      ),
    );

    if (!safetyPassResult.success) {
      throw new Error(`Safety pass failed: ${safetyPassResult.report.error}`);
    }

    report = {
      ...report,
      safetyPassReport: safetyPassResult.report,
    };

    // Step 5: Validate results
    report = updateHarnessStatus(report, "validating_results");
    const validationStart = Date.now();

    // Verify guest source partitions still exist
    const guestSourcePartitionsExist = verifyMockGuestDataExists();

    // Verify target partitions were copied
    let targetPartitionsCopied = false;
    if (mmkvStorage) {
      for (const entityName of ["tasks", "habits", "meals", "budget", "workouts", "calendar"]) {
        const targetKey = getEntityStorageKey(entityName, authenticatedContext);
        const targetData = mmkvStorage.getString(targetKey);
        if (targetData) {
          targetPartitionsCopied = true;
          break;
        }
      }
    }

    // Verify rollback snapshot was created
    const rollbackSnapshotCreated = safetyPassResult.report.rollbackSnapshot?.isAvailable === true;

    // Verify sync transfer was prepared
    const syncTransferPrepared = safetyPassResult.report.syncTransferPreview?.success === true;

    // Verify orphan tracking record exists
    const orphanTrackingRecordExists = safetyPassResult.report.orphanedGuestTracking?.success === true;

    // Verify guest data is untouched (still exists)
    const guestDataUntouched = verifyMockGuestDataExists();

    const validationResults = {
      guestSourcePartitionsExist,
      targetPartitionsCopied,
      rollbackSnapshotCreated,
      syncTransferPrepared,
      orphanTrackingRecordExists,
      guestDataUntouched,
    };

    steps.push(
      createStepResult(
        "validate_results",
        true,
        Date.now() - validationStart,
        undefined,
        validationResults,
      ),
    );

    report = {
      ...report,
      validationResults,
    };

    // Step 6: Complete
    report = updateHarnessStatus(report, "completed");
    report.completedAt = new Date().toISOString();
    report.steps = steps;
    currentReport = report;

    const summary = [
      `Test harness completed in ${Date.now() - startTime}ms`,
      `Guest source partitions exist: ${guestSourcePartitionsExist}`,
      `Target partitions copied: ${targetPartitionsCopied}`,
      `Rollback snapshot created: ${rollbackSnapshotCreated}`,
      `Sync transfer prepared: ${syncTransferPrepared}`,
      `Orphan tracking exists: ${orphanTrackingRecordExists}`,
      `Guest data untouched: ${guestDataUntouched}`,
    ].join("\n");

    console.log("[MigrationSafetyHarness] Test harness completed:", summary);

    return {
      success: true,
      report,
      summary,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[MigrationSafetyHarness] Test harness failed:", err);

    report = updateHarnessStatus(report, "failed");
    report.completedAt = new Date().toISOString();
    report.error = message;
    report.steps = steps;
    currentReport = report;

    return {
      success: false,
      report,
      summary: `Test harness failed: ${message}`,
    };
  } finally {
    isRunning = false;
  }
}

/**
 * Reset the migration safety test harness.
 * Clears the current report and running state.
 *
 * WARNING: This does not clear mock test data. Use clearMockMigrationTestData() for that.
 */
export function resetMigrationSafetyHarness(): void {
  if (!__DEV__) {
    console.warn("[MigrationSafetyHarness] Reset only runs in __DEV__ mode");
    return;
  }

  currentReport = null;
  isRunning = false;
  resetGuestMigrationSafetyState();
  console.log("[MigrationSafetyHarness] Test harness reset");
}

/**
 * Get the current migration safety test harness report.
 *
 * @returns Current test harness report or null
 */
export function getMigrationSafetyHarnessReport(): MigrationHarnessReport | null {
  return currentReport;
}
