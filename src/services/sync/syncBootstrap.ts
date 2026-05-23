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

import { runQueueRecovery, isQueueHealthy } from './queue/queue.recovery';
import { startBackgroundSync, forceReleaseLock } from './queue/syncProcessor';
import { logSyncHealth } from './monitor/syncHealth';

// ── State ───────────────────────────────────────────────────────────────────

let isBootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

// ── Bootstrap Implementation ─────────────────────────────────────────────────

/**
 * Internal bootstrap implementation.
 * Runs recovery and starts sync processor.
 */
async function doBootstrap(): Promise<void> {
  console.log('[SyncBootstrap] Starting sync system bootstrap...');

  try {
    // Step 1: Release any stuck locks (crash recovery)
    console.log('[SyncBootstrap] Releasing any stuck processing locks...');
    forceReleaseLock();

    // Step 2: Run queue recovery
    console.log('[SyncBootstrap] Running queue recovery...');
    const recoveryResult = runQueueRecovery();

    if (recoveryResult.corruptedRemoved > 0) {
      console.warn(
        `[SyncBootstrap] Removed ${recoveryResult.corruptedRemoved} corrupted queue items`
      );
    }

    if (recoveryResult.failedReset > 0) {
      console.log(
        `[SyncBootstrap] Reset ${recoveryResult.failedReset} failed items for retry`
      );
    }

    // Step 3: Check queue health
    const isHealthy = isQueueHealthy();
    if (!isHealthy) {
      console.warn('[SyncBootstrap] Queue health check indicates issues');
    }

    // Step 4: Log initial health state
    console.log('[SyncBootstrap] Initial sync health:');
    logSyncHealth();

    // Step 5: Start background sync processing
    console.log('[SyncBootstrap] Starting background sync processor...');
    startBackgroundSync();

    console.log('[SyncBootstrap] Bootstrap complete');
  } catch (error) {
    console.error('[SyncBootstrap] Bootstrap failed:', error);
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
    console.log('[SyncBootstrap] Bootstrap already in progress, skipping');
    return;
  }

  // Prevent multiple completed bootstraps
  if (isBootstrapped) {
    console.log('[SyncBootstrap] Already bootstrapped, skipping');
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
  console.warn('[SyncBootstrap] Force rebootstrap requested');
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
