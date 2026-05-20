/**
 * Network Awareness Utilities
 *
 * Provides reactive connectivity detection using NetInfo.
 * Used by sync queue to gate operations and trigger retries.
 */

import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';

type NetworkListener = (isOnline: boolean) => void;

let currentState: boolean = true;
let subscription: NetInfoSubscription | null = null;
const listeners = new Set<NetworkListener>();

/**
 * Initialize network monitoring.
 * Call once at app startup. Safe to call multiple times.
 */
export function startNetworkMonitoring(): void {
  if (subscription) return;

  subscription = NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = !!(state.isConnected && state.isInternetReachable !== false);

    if (isOnline !== currentState) {
      currentState = isOnline;
      listeners.forEach((listener) => listener(isOnline));
    }
  });
}

/**
 * Stop network monitoring and clean up subscriptions.
 */
export function stopNetworkMonitoring(): void {
  if (subscription) {
    subscription();
    subscription = null;
  }
  listeners.clear();
}

/**
 * Check current connectivity state synchronously.
 * Returns the last known state — may be stale if monitoring hasn't started.
 */
export function isOnline(): boolean {
  return currentState;
}

/**
 * Fetch current connectivity state from the system (async, accurate).
 */
export async function checkConnectivity(): Promise<boolean> {
  const state = await NetInfo.fetch();
  currentState = !!(state.isConnected && state.isInternetReachable !== false);
  return currentState;
}

/**
 * Subscribe to connectivity changes.
 * Returns an unsubscribe function.
 *
 * @example
 * const unsub = onConnectivityChange((online) => {
 *   if (online) processSyncQueue();
 * });
 */
export function onConnectivityChange(listener: NetworkListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Wait until the device is online.
 * Resolves immediately if already connected.
 * Useful for gating sync operations.
 */
export function waitForOnline(): Promise<void> {
  if (currentState) return Promise.resolve();

  return new Promise((resolve) => {
    const unsub = onConnectivityChange((online) => {
      if (online) {
        unsub();
        resolve();
      }
    });
  });
}
