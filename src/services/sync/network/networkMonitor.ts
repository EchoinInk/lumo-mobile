/**
 * Network Monitor
 *
 * Monitors network connectivity and coordinates sync behavior.
 *
 * Responsibilities:
 * - Track network state changes
 * - Pause sync while offline
 * - Resume sync when online
 * - Prevent aggressive retries while offline
 * - Avoid duplicate processor starts
 *
 * Architecture:
 *   NetInfo → NetworkMonitor → SyncProcessor
 */

import NetInfo from "@react-native-community/netinfo";
import { logSyncError, logSyncEvent } from "../monitor/syncLogger";
import { startBackgroundSync } from "../queue/syncProcessor";
import type { NetworkState, NetworkStatus } from "./network.types";

// ── State ───────────────────────────────────────────────────────────────────

let currentState: NetworkState = "unknown";
let currentStatus: NetworkStatus | null = null;
let listeners: Set<(state: NetworkState) => void> = new Set();
let isInitialized = false;

// ── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Convert NetInfo state to our NetworkState.
 */
function toNetworkState(
  netInfoState: ReturnType<typeof NetInfo.fetch>,
): NetworkState {
  if (!netInfoState.isConnected) return "offline";
  if (netInfoState.isInternetReachable === false) return "offline";
  return "online";
}

/**
 * Convert NetInfo state to our NetworkStatus.
 */
function toNetworkStatus(
  netInfoState: ReturnType<typeof NetInfo.fetch>,
): NetworkStatus {
  return {
    isConnected: netInfoState.isConnected ?? false,
    type: netInfoState.type as any,
    isInternetReachable: netInfoState.isInternetReachable,
    lastChangedAt: new Date().toISOString(),
  };
}

/**
 * Handle network state change.
 */
function handleNetworkChange(
  netInfoState: ReturnType<typeof NetInfo.fetch>,
): void {
  const previousState = currentState;
  const newState = toNetworkState(netInfoState);
  const newStatus = toNetworkStatus(netInfoState);

  currentState = newState;
  currentStatus = newStatus;

  logSyncEvent(
    "Network",
    undefined,
    undefined,
    newState.toUpperCase(),
    `Network state changed: ${previousState} → ${newState}`,
  );

  // Notify listeners
  for (const listener of listeners) {
    listener(newState);
  }

  // Resume sync when coming online
  if (previousState === "offline" && newState === "online") {
    logSyncEvent(
      "Network",
      undefined,
      undefined,
      "RESUME",
      "Network restored, resuming sync",
    );
    startBackgroundSync();
  }

  // Pause sync when going offline
  if (previousState === "online" && newState === "offline") {
    logSyncEvent(
      "Network",
      undefined,
      undefined,
      "PAUSE",
      "Network lost, pausing sync",
    );
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize network monitoring.
 * Should be called once at app startup.
 */
export function initializeNetworkMonitor(): void {
  if (isInitialized) {
    console.log("[NetworkMonitor] Already initialized, skipping");
    return;
  }

  isInitialized = true;

  // Get initial state
  NetInfo.fetch()
    .then((netInfoState) => {
      currentState = toNetworkState(netInfoState);
      currentStatus = toNetworkStatus(netInfoState);
      logSyncEvent(
        "Network",
        undefined,
        undefined,
        currentState.toUpperCase(),
        `Initial network state: ${currentState}`,
      );
    })
    .catch((error) => {
      logSyncError("Network", undefined, undefined, error, {
        context: "initial fetch",
      });
    });

  // Subscribe to changes
  NetInfo.addEventListener(handleNetworkChange);
}

/**
 * Get current network state.
 */
export function getNetworkState(): NetworkState {
  return currentState;
}

/**
 * Get current network status details.
 */
export function getNetworkStatus(): NetworkStatus | null {
  return currentStatus;
}

/**
 * Check if device is currently online.
 */
export function isOnline(): boolean {
  return currentState === "online";
}

/**
 * Check if device is currently offline.
 */
export function isOffline(): boolean {
  return currentState === "offline";
}

/**
 * Subscribe to network state changes.
 * Returns unsubscribe function.
 */
export function subscribeToNetworkChanges(
  callback: (state: NetworkState) => void,
): () => void {
  listeners.add(callback);

  // Return unsubscribe function
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Manually refresh network state.
 * Useful for testing or after wake from sleep.
 */
export async function refreshNetworkState(): Promise<void> {
  try {
    const netInfoState = await NetInfo.fetch();
    handleNetworkChange(netInfoState);
  } catch (error) {
    logSyncError("Network", undefined, undefined, error, {
      context: "refresh",
    });
  }
}
