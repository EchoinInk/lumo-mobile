/**
 * Network Types for Sync
 *
 * Type definitions for network monitoring and connectivity awareness.
 */

/**
 * Network connectivity state.
 */
export type NetworkState = 'online' | 'offline' | 'unknown';

/**
 * Network connection type.
 */
export type ConnectionType =
  | 'none'
  | 'wifi'
  | 'cellular'
  | 'unknown';

/**
 * Network status information.
 */
export interface NetworkStatus {
  /** Whether device is connected to network */
  isConnected: boolean;
  /** Type of network connection */
  type: ConnectionType;
  /** Whether connection is expensive (cellular) */
  isInternetReachable?: boolean;
  /** ISO timestamp of last status change */
  lastChangedAt: string;
}

/**
 * Network state change event.
 */
export interface NetworkChangeEvent {
  /** Previous network state */
  previousState: NetworkState;
  /** New network state */
  newState: NetworkState;
  /** Timestamp of change */
  timestamp: string;
}
