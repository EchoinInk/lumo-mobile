/**
 * App Initialization
 *
 * Bootstraps backend infrastructure on app startup.
 * Called once from the root layout.
 *
 * Note: Sync initialization is now handled by SyncProvider in app/_layout.tsx
 * This file only handles auth session restoration.
 */

import { useAuthStore } from "@/features/auth";

let initialized = false;

/**
 * Initialize all backend systems.
 * Safe to call multiple times — will only run once.
 */
export function initializeBackend(): void {
  if (initialized) return;
  initialized = true;

  // Auth session restoration — non-blocking
  useAuthStore
    .getState()
    .restoreSession()
    .catch((error) => {
      console.warn("[Init] Session restoration failed:", error);
      useAuthStore.getState().setHydrated();
    });
}
