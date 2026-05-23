/**
 * Sync Provider
 *
 * Initializes the sync system on app startup.
 * Ensures bootstrapSync() runs exactly once, safely.
 *
 * Safety guarantees:
 * - Safe under React StrictMode (uses ref)
 * - Safe under Fast Refresh (ref persists)
 * - Safe under navigation remounts (idempotent)
 *
 * Responsibility:
 * - Initialize network monitoring
 * - Bootstrap sync system
 * - Track startup timing
 * - Log initialization events
 */

import { useEffect, useRef } from 'react';
import { bootstrapSync } from '@/services/sync/syncBootstrap';
import { initializeNetworkMonitor } from '@/services/sync/network';
import { logSyncEvent, logBootstrapTiming } from '@/services/sync/monitor/syncLogger';
import { useSyncStore } from '@/store/useSyncStore';

// ── Singleton State ─────────────────────────────────────────────────────────

let hasInitialized = false;
let initializationStartTime: number | null = null;

// ── Sync Provider Component ───────────────────────────────────────────────────

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const setOffline = useSyncStore((state) => state.setOffline);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations (StrictMode, Fast Refresh, remounts)
    if (initRef.current || hasInitialized) {
      return;
    }

    initRef.current = true;
    hasInitialized = true;
    initializationStartTime = Date.now();

    const bootstrap = async () => {
      const startTime = Date.now();

      try {
        logSyncEvent('Bootstrap', undefined, undefined, 'START', 'Starting sync system initialization');

        // Step 1: Initialize network monitoring
        const networkStart = Date.now();
        initializeNetworkMonitor();
        const networkDuration = Date.now() - networkStart;
        logBootstrapTiming('Network monitoring', networkDuration);

        // Step 2: Bootstrap sync system (recovery + processor)
        const syncStart = Date.now();
        bootstrapSync();
        const syncDuration = Date.now() - syncStart;
        logBootstrapTiming('Sync bootstrap', syncDuration);

        // Step 3: Update offline state from network monitor
        // (This will be updated by network monitor events, but set initial state)
        const totalDuration = Date.now() - startTime;
        logBootstrapTiming('Total initialization', totalDuration);

        logSyncEvent('Bootstrap', undefined, undefined, 'COMPLETE', `Sync system initialized in ${totalDuration}ms`);
      } catch (error) {
        logSyncEvent('Bootstrap', undefined, undefined, 'ERROR', 'Sync system initialization failed');
        console.error('[SyncProvider] Initialization failed:', error);
      }
    };

    // Run bootstrap asynchronously (non-blocking)
    bootstrap();
  }, [setOffline]);

  return <>{children}</>;
}

// ── Development Utilities ───────────────────────────────────────────────────

/**
 * Check if sync system has been initialized.
 * Useful for debugging and testing.
 */
export function isSyncInitialized(): boolean {
  return hasInitialized;
}

/**
 * Get initialization duration in milliseconds.
 * Returns null if not yet initialized.
 */
export function getInitializationDuration(): number | null {
  if (!initializationStartTime) return null;
  if (!hasInitialized) return null;
  return Date.now() - initializationStartTime;
}
