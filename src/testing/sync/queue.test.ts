import {
  clearQueue,
  getFailedItems,
  getPendingItems,
  incrementRetry,
  recordQueueItem,
} from "@/services/storage/syncQueue";
import { MAX_RETRY_COUNT } from "@/services/storage/queue.types";
import { assertEqual, resetTestState } from "../testUtils";

export function testQueueRecordPersistsPendingItem(): void {
  resetTestState();
  clearQueue();

  const item = recordQueueItem({
    ownerType: "guest",
    localOwnerId: "owner",
    syncPartitionKey: "guest:owner:syncQueue",
    entity: "task",
    operation: "create",
    entityId: "task-1",
    payload: { systemTestPayload: true },
  });

  assertEqual(item.status, "pending", "new queue item should be pending");
  assertEqual(getPendingItems().length, 1, "pending queue item should persist");
}

export function testRetryExhaustionFailsSafely(): void {
  resetTestState();
  clearQueue();

  const item = recordQueueItem({
    ownerType: "guest",
    localOwnerId: "owner",
    syncPartitionKey: "guest:owner:syncQueue",
    entity: "task",
    operation: "update",
    entityId: "task-1",
    payload: { systemTestPayload: true },
  });

  for (let index = 0; index < MAX_RETRY_COUNT; index += 1) {
    incrementRetry(item.id, "network unavailable");
  }

  assertEqual(
    getPendingItems().length,
    0,
    "retry-exhausted items should leave pending queue",
  );
  assertEqual(
    getFailedItems()[0]?.status,
    "failed",
    "retry-exhausted items should be marked failed",
  );
}
