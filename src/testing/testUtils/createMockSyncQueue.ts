import type { QueueItemStatus, SyncQueueItem } from "@/services/storage/queue.types";

export function createMockSyncQueueItem(
  overrides: Partial<SyncQueueItem> = {},
): SyncQueueItem {
  const id = overrides.id ?? "queue_item_1";

  return {
    id,
    ownerType: "guest",
    localOwnerId: "local-owner",
    cloudOwnerId: undefined,
    syncPartitionKey: "guest:local-owner:syncQueue",
    createdDuringMigration: false,
    entity: "task",
    operation: "update",
    entityId: `entity_${id}`,
    timestamp: new Date().toISOString(),
    payload: { systemTestPayload: true },
    retryCount: 0,
    status: "pending" as QueueItemStatus,
    error: null,
    idempotencyKey: `task:entity_${id}:update:test`,
    lastAttemptAt: null,
    syncedAt: null,
    ...overrides,
  };
}
