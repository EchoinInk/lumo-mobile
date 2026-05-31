import { generateQueueDiagnostics } from "@/services/sync/recovery/queueDiagnostics";
import {
  detectCorruptedQueueItems,
  removeCorruptedQueueItems,
} from "@/services/sync/recovery/recoverCorruptedQueue";
import { replayFailedQueue } from "@/services/sync/recovery/replayFailedQueue";
import { getSyncHealthMetrics } from "@/services/sync/recovery/syncHealth";
import {
  detectStaleCacheEntries,
  removeStaleCacheEntries,
} from "@/services/sync/recovery/staleCacheRecovery";
import { getEntityStorageKey } from "@/services/storage/storagePartition";
import { SYNC_QUEUE_STORAGE_KEY } from "@/services/storage/queue.types";
import { storageInstance } from "@/store/storage";
import {
  assert,
  assertEqual,
  createMockSyncQueueItem,
  resetTestState,
} from "../testUtils";

const LEGACY_SYNC_QUEUE_KEY = "sync_queue";

export async function testFailedQueueReplayIsRetrySafe(): Promise<void> {
  resetTestState();
  const replayable = createMockSyncQueueItem({
    id: "failed-1",
    status: "failed",
    retryCount: 1,
  });
  const exhausted = createMockSyncQueueItem({
    id: "failed-2",
    status: "failed",
    retryCount: 3,
  });

  storageInstance.set(
    LEGACY_SYNC_QUEUE_KEY,
    JSON.stringify([replayable, exhausted]),
  );

  const replayedCount = await replayFailedQueue(3);
  const queue = JSON.parse(
    storageInstance.getString(LEGACY_SYNC_QUEUE_KEY) ?? "[]",
  );

  assertEqual(replayedCount, 1, "only retry-safe failed items should replay");
  assertEqual(queue[0].status, "pending", "replayed item should become pending");
  assertEqual(queue[0].retryCount, 2, "replayed item should increment retry count");
  assertEqual(queue[1].status, "failed", "exhausted item should stay failed");
}

export function testCorruptedQueueRecoveryRemovesInvalidItemsOnce(): void {
  resetTestState();
  const valid = createMockSyncQueueItem({ id: "valid" });
  const corrupted = { ...createMockSyncQueueItem({ id: "corrupt" }), entityId: "" };

  storageInstance.set(
    LEGACY_SYNC_QUEUE_KEY,
    JSON.stringify([valid, corrupted]),
  );

  assertEqual(
    detectCorruptedQueueItems().length,
    1,
    "corruption detection should identify invalid records",
  );
  assertEqual(
    removeCorruptedQueueItems(),
    1,
    "corruption recovery should remove invalid records",
  );
  assertEqual(
    removeCorruptedQueueItems(),
    0,
    "corruption recovery should not duplicate writes on repeat",
  );
}

export function testSyncHealthReturnsSafeDefaultsForEmptyState(): void {
  resetTestState();

  const metrics = getSyncHealthMetrics();

  assertEqual(metrics.totalItems, 0, "empty sync health should have no items");
  assertEqual(metrics.healthScore, 100, "empty sync health should be healthy");
}

export function testQueueDiagnosticsHandlesMalformedItems(): void {
  resetTestState();
  const malformed = {
    status: "failed",
    retryCount: 4,
    error: "network",
  };

  storageInstance.set(SYNC_QUEUE_STORAGE_KEY, JSON.stringify([malformed]));

  const report = generateQueueDiagnostics();

  assertEqual(report.totalItems, 1, "diagnostics should keep malformed count");
  assertEqual(report.itemsByStatus.failed, 1, "diagnostics should count statuses");
  assert(report.recommendations.length > 0, "diagnostics should return guidance");
}

export function testStaleCacheRecoveryHandlesEmptyState(): void {
  resetTestState();

  assertEqual(
    detectStaleCacheEntries("owner-empty").length,
    0,
    "empty stale cache detection should be safe",
  );
  assertEqual(
    removeStaleCacheEntries("owner-empty"),
    0,
    "empty stale cache removal should be safe",
  );
}

export function testStaleCacheRecoveryRemovesExpiredEntries(): void {
  resetTestState();
  const ownerId = "owner-stale";
  const staleKey = getEntityStorageKey("tasks", {
    accountMode: "guest",
    localOwnerId: ownerId,
    cloudOwnerId: undefined,
    storagePartitionKey: `guest:${ownerId}`,
    syncPartitionKey: `guest:${ownerId}:syncQueue`,
    isMigrating: false,
  });
  const staleTimestamp = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();

  storageInstance.set(staleKey, JSON.stringify({ timestamp: staleTimestamp }));

  assertEqual(
    detectStaleCacheEntries(ownerId).length,
    1,
    "stale cache detection should find expired records",
  );
  assertEqual(
    removeStaleCacheEntries(ownerId),
    1,
    "stale cache removal should remove expired records",
  );
}
