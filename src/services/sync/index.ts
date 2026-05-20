/**
 * Sync System Barrel
 *
 * Public API for the offline-first sync architecture.
 */

export {
  enqueue,
  loadQueue,
  getPendingEntries,
  getFailedEntries,
  markCompleted,
  markFailed,
  clearQueue,
  clearCompleted,
  getPendingCount,
  hasPendingOperations,
} from './syncQueue';

export {
  registerSyncHandler,
  processQueue,
  startSyncProcessor,
  stopSyncProcessor,
  isSyncProcessing,
} from './syncProcessor';
