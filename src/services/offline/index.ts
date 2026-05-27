/**
 * Offline Services
 *
 * Offline resilience utilities for Lumo.
 */

export {
  useOfflineManager,
  isOffline,
  getNetworkInfo,
  formatOfflineDuration,
} from "./offlineManager";

export {
  queueOfflineOperation,
  getOfflineQueueItems,
  getUnreplayedOfflineItems,
  markOfflineItemReplayed,
  clearReplayedOfflineItems,
  clearOfflineQueue,
} from "./offlineQueue";

export type { OfflineState, OfflineManagerConfig, OfflineQueueItem } from "./offlineManager";
