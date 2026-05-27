/**
 * Offline Services
 *
 * Offline resilience utilities for Lumo.
 */

export {
    formatOfflineDuration, getNetworkInfo, isOffline, useOfflineManager
} from "./offlineManager";

export {
    clearOfflineQueue, clearReplayedOfflineItems, getOfflineQueueItems,
    getUnreplayedOfflineItems,
    markOfflineItemReplayed, queueOfflineOperation
} from "./offlineQueue";

export type { OfflineManagerConfig, OfflineState } from "./offlineManager";
export type { OfflineQueueItem } from "./offlineQueue";

