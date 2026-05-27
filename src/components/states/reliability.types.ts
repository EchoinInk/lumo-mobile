/**
 * Reliability State Types
 *
 * Formalized reliability states for all feature screens.
 * These states are reusable primitives for consistent UX across the app.
 */

/**
 * Primary reliability states for feature screens.
 */
export type ReliabilityState =
  | "loading"
  | "empty"
  | "success"
  | "error"
  | "offline"
  | "syncing"
  | "retrying";

/**
 * Reliability state metadata.
 */
export interface ReliabilityStateMetadata {
  /** Current state */
  state: ReliabilityState;
  /** Error message if in error state */
  error?: string;
  /** Whether offline */
  isOffline?: boolean;
  /** Whether syncing */
  isSyncing?: boolean;
  /** Retry count */
  retryCount?: number;
  /** Last sync timestamp */
  lastSyncAt?: string;
}

/**
 * Reliability state transition.
 */
export interface ReliabilityStateTransition {
  from: ReliabilityState;
  to: ReliabilityState;
  timestamp: string;
  reason?: string;
}

/**
 * Reliability state configuration.
 */
export interface ReliabilityStateConfig {
  /** Whether to show skeleton during loading */
  showSkeleton?: boolean;
  /** Whether to show retry button on error */
  showRetry?: boolean;
  /** Whether to show offline banner */
  showOfflineBanner?: boolean;
  /** Whether to show sync indicator */
  showSyncIndicator?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom empty message */
  emptyMessage?: string;
  /** Custom error message */
  errorMessage?: string;
}
