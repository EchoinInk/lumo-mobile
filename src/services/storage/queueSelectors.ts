/**
 * Queue Selectors
 *
 * Query and filter functions for the sync queue.
 * Provides derived views of queue state for UI and sync logic.
 */

import {
  SyncQueueItem,
  SyncOperation,
  QueueItemStatus,
  SyncEntity,
} from './queue.types';
import { getQueueItems, getPendingItems, getFailedItems } from './syncQueue';

// ── Status Selectors ───────────────────────────────────────────────────────

/**
 * Get all pending items (excluding failed/over-retried).
 */
export function selectPendingItems(): SyncQueueItem[] {
  return getPendingItems();
}

/**
 * Get all failed items (exceeded retry limit).
 */
export function selectFailedItems(): SyncQueueItem[] {
  return getFailedItems();
}

/**
 * Get items by specific status.
 */
export function selectItemsByStatus(status: QueueItemStatus): SyncQueueItem[] {
  return getQueueItems().filter((item) => item.status === status);
}

// ── Entity Selectors ───────────────────────────────────────────────────────

/**
 * Get items filtered by entity type.
 */
export function selectItemsByEntity(entity: SyncEntity): SyncQueueItem[] {
  return getQueueItems().filter((item) => item.entity === entity);
}

/**
 * Get items for a specific entity ID.
 */
export function selectItemsByEntityId(entityId: string): SyncQueueItem[] {
  return getQueueItems().filter((item) => item.entityId === entityId);
}

/**
 * Get pending items for a specific entity type.
 */
export function selectPendingByEntity(entity: SyncEntity): SyncQueueItem[] {
  return getPendingItems().filter((item) => item.entity === entity);
}

// ── Operation Selectors ────────────────────────────────────────────────────

/**
 * Get items by operation type.
 */
export function selectItemsByOperation(
  operation: SyncOperation
): SyncQueueItem[] {
  return getQueueItems().filter((item) => item.operation === operation);
}

/**
 * Get pending create operations.
 */
export function selectPendingCreates(): SyncQueueItem[] {
  return getPendingItems().filter((item) => item.operation === 'create');
}

/**
 * Get pending update operations.
 */
export function selectPendingUpdates(): SyncQueueItem[] {
  return getPendingItems().filter((item) => item.operation === 'update');
}

/**
 * Get pending delete operations.
 */
export function selectPendingDeletes(): SyncQueueItem[] {
  return getPendingItems().filter((item) => item.operation === 'delete');
}

// ── Count Selectors ────────────────────────────────────────────────────────

/**
 * Get count of pending items.
 */
export function selectPendingCount(): number {
  return getPendingItems().length;
}

/**
 * Get count of failed items.
 */
export function selectFailedCount(): number {
  return getFailedItems().length;
}

/**
 * Get total queue size.
 */
export function selectQueueSize(): number {
  return getQueueItems().length;
}

/**
 * Get count by entity type.
 */
export function selectCountByEntity(entity: SyncEntity): number {
  return getQueueItems().filter((item) => item.entity === entity).length;
}

/**
 * Get count by operation type.
 */
export function selectCountByOperation(operation: SyncOperation): number {
  return getQueueItems().filter((item) => item.operation === operation).length;
}

// ── Boolean Selectors ──────────────────────────────────────────────────────

/**
 * Check if there are any pending operations.
 */
export function selectHasPending(): boolean {
  return getPendingItems().length > 0;
}

/**
 * Check if there are any failed operations.
 */
export function selectHasFailed(): boolean {
  return getFailedItems().length > 0;
}

/**
 * Check if a specific entity has pending operations.
 */
export function selectEntityHasPending(
  entity: SyncEntity,
  entityId?: string
): boolean {
  const items = getPendingItems();
  if (entityId) {
    return items.some(
      (item) => item.entity === entity && item.entityId === entityId
    );
  }
  return items.some((item) => item.entity === entity);
}

// ── Complex Selectors ───────────────────────────────────────────────────────

/**
 * Get the most recent queue items (by timestamp).
 * @param limit - Maximum number of items to return
 */
export function selectRecentItems(limit: number = 10): SyncQueueItem[] {
  return getQueueItems()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get oldest pending items (for processing order).
 * @param limit - Maximum number of items to return
 */
export function selectOldestPending(limit?: number): SyncQueueItem[] {
  const sorted = getPendingItems().sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Group pending items by entity type.
 */
export function selectPendingByEntityGroup(): Record<SyncEntity, SyncQueueItem[]> {
  const items = getPendingItems();
  const groups: Partial<Record<SyncEntity, SyncQueueItem[]>> = {};

  for (const item of items) {
    if (!groups[item.entity]) {
      groups[item.entity] = [];
    }
    groups[item.entity]!.push(item);
  }

  return groups as Record<SyncEntity, SyncQueueItem[]>;
}

/**
 * Group pending items by operation type.
 */
export function selectPendingByOperationGroup(): Record<
  SyncOperation,
  SyncQueueItem[]
> {
  const items = getPendingItems();
  const groups: Record<SyncOperation, SyncQueueItem[]> = {
    create: [],
    update: [],
    delete: [],
  };

  for (const item of items) {
    groups[item.operation].push(item);
  }

  return groups;
}

/**
 * Get the next item to process (oldest pending).
 * Returns null if no pending items.
 */
export function selectNextPendingItem(): SyncQueueItem | null {
  const pending = getPendingItems();
  if (pending.length === 0) return null;

  return pending.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )[0];
}

/**
 * Check if an entity has a pending delete operation.
 * Used to filter entities that should be hidden from UI.
 */
export function selectEntityHasPendingDelete(entityId: string): boolean {
  return getPendingItems().some(
    (item) => item.entityId === entityId && item.operation === 'delete'
  );
}

/**
 * Get all unique entity IDs in the queue.
 */
export function selectQueuedEntityIds(): string[] {
  const items = getQueueItems();
  const ids = new Set<string>();
  for (const item of items) {
    ids.add(item.entityId);
  }
  return Array.from(ids);
}

/**
 * Get queue statistics summary.
 */
export function selectQueueStats(): {
  total: number;
  pending: number;
  failed: number;
  completed: number;
  byEntity: Record<SyncEntity, number>;
  byOperation: Record<SyncOperation, number>;
} {
  const items = getQueueItems();

  const byEntity: Partial<Record<SyncEntity, number>> = {};
  const byOperation: Record<SyncOperation, number> = {
    create: 0,
    update: 0,
    delete: 0,
  };

  for (const item of items) {
    byEntity[item.entity] = (byEntity[item.entity] || 0) + 1;
    byOperation[item.operation]++;
  }

  return {
    total: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    failed: items.filter((i) => i.status === 'failed').length,
    completed: items.filter((i) => i.status === 'completed').length,
    byEntity: byEntity as Record<SyncEntity, number>,
    byOperation,
  };
}
