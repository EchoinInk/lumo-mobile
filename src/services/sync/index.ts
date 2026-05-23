/**
 * Sync System Barrel
 *
 * Public API for the offline-first sync architecture.
 *
 * Exports:
 * - Bootstrap: sync system initialization
 * - Queue: queue operations (from storage layer)
 * - Config: sync configuration constants
 * - Network: network monitoring
 * - Monitor: logging and metrics
 */

// Bootstrap
export {
    bootstrapSync,
    forceRebootstrap,
    isBootstrapInProgress,
    isSyncBootstrapped,
    waitForBootstrap
} from "./syncBootstrap";

// Queue operations (from storage layer - canonical source)
export {
    clearCompleted,
    clearQueue,
    getFailedItems,
    getItemsByEntity,
    getItemsByEntityId,
    getPendingCount,
    getPendingItems,
    getQueueItems,
    getQueueItemsByStatus,
    hasPendingOperations,
    incrementRetry,
    markCompleted,
    recordQueueItem,
    removeItem,
    removeItemsByEntityId,
    updateItemStatus
} from "../storage/syncQueue";

// Queue types (from storage layer - canonical source)
export type {
    CreateQueueItemInput,
    QueueOperationResult,
    SyncQueueItem
} from "../storage/queue.types";

export {
    MAX_RETRY_COUNT,
    SYNC_QUEUE_STORAGE_KEY
} from "../storage/queue.types";

// Configuration
export {
    DEAD_LETTER_STORAGE_KEY,
    DEDUP_STORAGE_KEY,
    DEDUP_TTL_MS,
    HEALTH_FAILURE_THRESHOLD,
    MAX_SYNC_RETRIES,
    SYNC_BATCH_DELAY,
    SYNC_BATCH_SIZE,
    SYNC_LOG_PREFIX,
    SYNC_RETRY_BASE_DELAY,
    SYNC_RETRY_JITTER_FACTOR,
    SYNC_RETRY_MAX_DELAY,
    SYNC_VERBOSE_LOGGING
} from "./config";

// Network monitoring
export {
    getNetworkState,
    getNetworkStatus,
    initializeNetworkMonitor,
    isOffline,
    isOnline,
    refreshNetworkState,
    subscribeToNetworkChanges
} from "./network";

export type {
    ConnectionType,
    NetworkChangeEvent,
    NetworkState,
    NetworkStatus
} from "./network";

// Monitor: logging
export {
    logBootstrapTiming,
    logDeadLetter,
    logRecoveryAction,
    logSyncError,
    logSyncEvent,
    logVerbose
} from "./monitor/syncLogger";

// Monitor: selectors
export {
    getAllEntityStats,
    getDeadLetterCount,
    getDeadLetterItems,
    getEntitySyncStats,
    getFailedCount,
    getOldestPendingTimestamp,
    getItemsByEntity as getQueueItemsByEntityType,
    getItemsByStatus as getQueueItemsByStatusType,
    getPendingCount as getQueuePendingCount,
    getSyncLag,
    getTotalQueueCount,
    isQueueHealthy
} from "./monitor/syncSelectors";

// Queue factory (canonical queue creation)
export {
    createQueueItem,
    createQueueItemWithVersion,
    createQueueItems
} from "./queue/queue.factory";

// Queue validation
export {
    isCorruptedItem,
    isValidEntityType,
    isValidOperation,
    isValidStatus,
    safeValidateQueueItem,
    validateQueueItem,
    validateQueueItemInput
} from "./queue/queue.validation";

export { QueueValidationError } from "./queue/queue.validation";

// Debug utilities (dev-only)
export {
    clearDeadLetterStorage,
    clearDeadLetters,
    clearDedupCache,
    inspectQueue,
    resetQueue,
    simulateFailure,
    syncDebug
} from "./debug";

// Sync processor
export {
    forceReleaseLock,
    getPendingSyncCount,
    getProcessingLockId,
    getDeadLetterCount as getProcessorDeadLetterCount,
    isSyncQueueProcessing,
    processSyncQueue,
    startBackgroundSync
} from "./queue/syncProcessor";

