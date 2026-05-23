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

// Queue lifecycle types and guards
export {
    canProcess,
    canRetry,
    checkInvariants,
    createLifecycleTransition,
    isOrphaned,
    isTerminalState,
    isValidQueueItem,
    isValidTransition,
    shouldDeadLetter,
    validateTransition
} from "./types";

export type {
    LifecycleEvent,
    LifecycleTransition,
    QueueItemState,
    StateTransition
} from "./types";

// Queue repair utilities
export { queueRepair } from "./repair";

export type { RepairResult } from "./repair";

// Sync diagnostics snapshot
export {
    createSyncSnapshot,
    exportSnapshotAsBase64,
    exportSnapshotAsJson
} from "./monitor/createSyncSnapshot";

export type { SyncSnapshot } from "./monitor/createSyncSnapshot";

// Sync stress-test utilities (dev-only)
export { syncStressTest } from "./testing";

export type { StressTestResult } from "./testing";

// Phase 11.3 — Replay safety + conflict foundation

// Idempotency key factory
export { createIdempotencyKey } from "./utils/createIdempotencyKey";

// Sync operation envelope type
export type { SyncOperationEnvelope } from "./types/syncOperation";

// Centralized queue state transitions
export {
    markQueueItemConflict,
    markQueueItemDeadLetter,
    markQueueItemFailed,
    markQueueItemProcessing,
    markQueueItemSynced
} from "./queue/queue.transitions";

// Retry policy
export {
    canRetryAttempt,
    getRetryDelay,
    isExhausted
} from "./retry/retryPolicy";

// Dead letter store
export {
    archiveDeadLetter,
    clearDeadLetters as clearDeadLetterStore,
    getDeadLetterCount as getDeadLetterStoreCount,
    getDeadLetters,
    getDeadLettersByEntity,
    getDeadLettersByUser,
    removeDeadLetter
} from "./deadLetter";

export type { DeadLetterEntry } from "./deadLetter";
