/**
 * Sync Bootstrap
 *
 * Safe startup trigger for the sync system.
 * Ensures only ONE instance runs and proper initialization order.
 *
 * On app launch:
 * 1. Run queue recovery
 * 2. Clean up expired dedup entries
 * 3. Start sync processor
 * 4. Ensure single instance
 *
 * Architecture:
 *   App Launch → Bootstrap → Recovery → Sync Processor
 *
 * Usage:
 *   // Call once at app startup
 *   bootstrapSync();
 *
 * Safety:
 * - Idempotent — safe to call multiple times
 * - Non-blocking — returns immediately, sync runs in background
 * - Handles crashes gracefully
 */

import { logSyncHealth } from "./monitor/syncHealth";
import { logSyncError, logSyncEvent } from "./monitor/syncLogger";
import { isQueueHealthy, runQueueRecovery } from "./queue/queue.recovery";
import { forceReleaseLock, startBackgroundSync } from "./queue/syncProcessor";

// ── State ───────────────────────────────────────────────────────────────────

let isBootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

// ── Bootstrap Implementation ─────────────────────────────────────────────────

/**
 * Internal bootstrap implementation.
 * Runs recovery and starts sync processor.
 */
async function doBootstrap(): Promise<void> {
  logSyncEvent(
    "Bootstrap",
    undefined,
    undefined,
    "START",
    "Starting sync system bootstrap",
  );

  try {
    // Step 1: Release any stuck locks (crash recovery)
    logSyncEvent(
      "Bootstrap",
      undefined,
      undefined,
      "RELEASE_LOCK",
      "Releasing any stuck processing locks",
    );
    forceReleaseLock();

    // Step 2: Run queue recovery
    logSyncEvent(
      "Bootstrap",
      undefined,
      undefined,
      "RECOVERY",
      "Running queue recovery",
    );
    const recoveryResult = runQueueRecovery();

    if (recoveryResult.corruptedRemoved > 0) {
      logSyncEvent(
        "Bootstrap",
        undefined,
        undefined,
        "CORRUPTED_REMOVED",
        `Removed ${recoveryResult.corruptedRemoved} corrupted queue items`,
      );
    }

    if (recoveryResult.failedReset > 0) {
      logSyncEvent(
        "Bootstrap",
        undefined,
        undefined,
        "FAILED_RESET",
        `Reset ${recoveryResult.failedReset} failed items for retry`,
      );
    }

    // Step 3: Check queue health
    const isHealthy = isQueueHealthy();
    if (!isHealthy) {
      logSyncEvent(
        "Bootstrap",
        undefined,
        undefined,
        "WARNING",
        "Queue health check indicates issues",
      );
    }

    // Step 4: Log initial health state
    logSyncEvent(
      "Bootstrap",
      undefined,
      undefined,
      "HEALTH_CHECK",
      "Logging initial sync health",
    );
    logSyncHealth();

    // Step 5: Start background sync processing
    logSyncEvent(
      "Bootstrap",
      undefined,
      undefined,
      "START_PROCESSOR",
      "Starting background sync processor",
    );
    startBackgroundSync();

    logSyncEvent(
      "Bootstrap",
      undefined,
      undefined,
      "COMPLETE",
      "Bootstrap complete",
    );
  } catch (error) {
    logSyncError("Bootstrap", undefined, undefined, error);
    // Don't throw — app should continue working locally
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Bootstrap the sync system on app startup.
 *
 * - Runs recovery
 * - Starts sync processor
 * - Ensures only ONE instance
 * - Non-blocking (returns immediately)
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function bootstrapSync(): void {
  // Prevent multiple concurrent bootstraps
  if (bootstrapPromise) {
    logSyncEvent(
      "Bootstrap",
      undefined,
      undefined,
      "SKIP",
      "Bootstrap already in progress",
    );
    return;
  }

  // Prevent multiple completed bootstraps
  if (isBootstrapped) {
    logSyncEvent(
      "Bootstrap",
      undefined,
      undefined,
      "SKIP",
      "Already bootstrapped",
    );
    return;
  }

  // Start bootstrap in background
  bootstrapPromise = doBootstrap().finally(() => {
    isBootstrapped = true;
    bootstrapPromise = null;
  });
}

/**
 * Force re-bootstrap the sync system.
 * Use with caution — primarily for development/debugging.
 */
export function forceRebootstrap(): void {
  logSyncEvent(
    "Bootstrap",
    undefined,
    undefined,
    "FORCE_REBOOT",
    "Force rebootstrap requested",
  );
  isBootstrapped = false;
  bootstrapPromise = null;
  bootstrapSync();
}

/**
 * Check if sync system has been bootstrapped.
 */
export function isSyncBootstrapped(): boolean {
  return isBootstrapped;
}

/**
 * Check if bootstrap is currently in progress.
 */
export function isBootstrapInProgress(): boolean {
  return bootstrapPromise !== null;
}

/**
 * Wait for bootstrap to complete.
 * Useful for tests or when you need to ensure sync is ready.
 */
export async function waitForBootstrap(): Promise<void> {
  if (bootstrapPromise) {
    await bootstrapPromise;
  }
}
