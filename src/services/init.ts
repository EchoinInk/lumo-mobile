/**
 * App Initialization
 *
 * Bootstraps backend infrastructure on app startup.
 * Called once from the root layout.
 *
 * Order matters:
 *   1. Start network monitoring (needed by sync)
 *   2. Start sync processor (listens for connectivity)
 *   3. Restore auth session (hydrate auth state)
 */

import { startNetworkMonitoring } from '@/utils/network';
import { startSyncProcessor } from '@/services/sync';
import { useAuthStore } from '@/features/auth';

let initialized = false;

/**
 * Initialize all backend systems.
 * Safe to call multiple times — will only run once.
 */
export function initializeBackend(): void {
  if (initialized) return;
  initialized = true;

  // 1. Network monitoring — must come first
  startNetworkMonitoring();

  // 2. Sync processor — reacts to connectivity changes
  startSyncProcessor();

  // 3. Auth session restoration — non-blocking
  useAuthStore.getState().restoreSession().catch((error) => {
    console.warn('[Init] Session restoration failed:', error);
    useAuthStore.getState().setHydrated();
  });
}
