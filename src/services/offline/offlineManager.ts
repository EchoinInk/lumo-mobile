/**
 * Offline Manager
 *
 * Manages offline state and provides offline resilience utilities.
 * Tracks network status, manages offline queue, and provides recovery hooks.
 */

import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Offline state.
 */
export interface OfflineState {
  /** Whether currently offline */
  isOffline: boolean;
  /** Network type (wifi, cellular, none, etc.) */
  networkType: string | null;
  /** Whether connection is expensive (cellular) */
  isConnectionExpensive: boolean | null;
  /** Last online timestamp */
  lastOnlineAt: string | null;
  /** Time since last online in milliseconds */
  timeSinceLastOnline: number;
}

/**
 * Offline manager configuration.
 */
export interface OfflineManagerConfig {
  /** Callback when offline state changes */
  onOfflineChange?: (isOffline: boolean) => void;
  /** Callback when network type changes */
  onNetworkTypeChange?: (networkType: string | null) => void;
  /** Whether to track last online time */
  trackLastOnline?: boolean;
}

/**
 * Offline manager hook.
 *
 * @param config - Offline manager configuration
 * @returns Offline state
 */
export function useOfflineManager(config: OfflineManagerConfig = {}): OfflineState {
  const [isOffline, setIsOffline] = useState(false);
  const [networkType, setNetworkType] = useState<string | null>(null);
  const [isConnectionExpensive, setIsConnectionExpensive] = useState<boolean | null>(null);
  const [lastOnlineAt, setLastOnlineAt] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const currentlyOffline = !state.isConnected;
      const currentNetworkType = state.type;
      const currentIsExpensive = state.details?.isConnectionExpensive ?? null;

      setIsOffline(currentlyOffline);
      setNetworkType(currentNetworkType);
      setIsConnectionExpensive(currentIsExpensive);

      if (!currentlyOffline && config.trackLastOnline !== false) {
        setLastOnlineAt(new Date().toISOString());
      }

      config.onOfflineChange?.(currentlyOffline);
      config.onNetworkTypeChange?.(currentNetworkType);
    });

    // Initialize state
    NetInfo.fetch().then((state) => {
      setIsOffline(!state.isConnected);
      setNetworkType(state.type);
      setIsConnectionExpensive(state.details?.isConnectionExpensive ?? null);

      if (state.isConnected && config.trackLastOnline !== false) {
        setLastOnlineAt(new Date().toISOString());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [config]);

  const timeSinceLastOnline = lastOnlineAt
    ? Date.now() - new Date(lastOnlineAt).getTime()
    : 0;

  return {
    isOffline,
    networkType,
    isConnectionExpensive,
    lastOnlineAt,
    timeSinceLastOnline,
  };
}

/**
 * Check if currently offline.
 *
 * @returns Promise resolving to offline status
 */
export async function isOffline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !state.isConnected;
}

/**
 * Get network information.
 *
 * @returns Promise resolving to network state
 */
export async function getNetworkInfo() {
  return NetInfo.fetch();
}

/**
 * Format offline duration for display.
 *
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatOfflineDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""}`;
  }
}
