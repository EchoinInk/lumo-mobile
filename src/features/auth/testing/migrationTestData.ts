/**
 * Migration Test Data Utilities
 *
 * Development-only utilities for seeding mock guest data and sync queue items
 * for testing the guest → account migration safety pass.
 *
 * Purpose:
 * - Seed mock guest partitions with test data
 * - Seed mock guest sync queue items
 * - Clear mock test data
 * - Get test repository contexts
 *
 * Rules:
 * - Only run in __DEV__ mode
 * - Never run automatically
 * - Never touch real active user partitions unless explicitly passed test context
 * - Use deterministic test IDs
 */

import {
    getEntityStorageKey,
    getSyncQueueStorageKey,
} from "../../../services/storage/storagePartition";
import { storageInstance as mmkvStorage } from "../../../store/storage";
import type { RepositoryContext } from "../types/auth.types";

// ── Test Constants ─────────────────────────────────────────────────────────────

export const TEST_GUEST_OWNER_ID = "test-guest-owner";
export const TEST_CLOUD_OWNER_ID = "test-cloud-owner";

const SUPPORTED_ENTITIES = [
  "tasks",
  "habits",
  "meals",
  "budget",
  "workouts",
  "calendar",
] as const;

// ── Mock Data Generators ─────────────────────────────────────────────────────────

function generateMockEntityData(entityName: string): string {
  const baseData = {
    id: `test-${entityName}-1`,
    title: `Test ${entityName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  switch (entityName) {
    case "tasks":
      return JSON.stringify({
        ...baseData,
        completed: false,
        priority: "medium",
        dueDate: new Date().toISOString(),
      });
    case "habits":
      return JSON.stringify({
        ...baseData,
        frequency: "daily",
        streakCount: 5,
        completedDates: [],
      });
    case "meals":
      return JSON.stringify({
        ...baseData,
        calories: 500,
        protein: 25,
        carbs: 50,
        fat: 15,
      });
    case "budget":
      return JSON.stringify({
        ...baseData,
        amount: 1000,
        category: "groceries",
        spent: 250,
      });
    case "workouts":
      return JSON.stringify({
        ...baseData,
        duration: 30,
        type: "cardio",
        caloriesBurned: 200,
      });
    case "calendar":
      return JSON.stringify({
        ...baseData,
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        location: "Test Location",
      });
    default:
      return JSON.stringify(baseData);
  }
}

function generateMockSyncQueueItem(entityName: string, index: number): string {
  return JSON.stringify({
    id: `test-sync-${entityName}-${index}`,
    operation: "create",
    entityName,
    entityId: `test-${entityName}-${index}`,
    timestamp: new Date().toISOString(),
    status: "pending",
    ownerType: "guest",
    localOwnerId: TEST_GUEST_OWNER_ID,
    cloudOwnerId: null,
    syncPartitionKey: `guest:${TEST_GUEST_OWNER_ID}:syncQueue`,
    createdDuringMigration: false,
  });
}

// ── Test Context Creation ───────────────────────────────────────────────────────

export function getMockMigrationContexts(): {
  guestContext: RepositoryContext;
  authenticatedContext: RepositoryContext;
} {
  const guestContext: RepositoryContext = {
    accountMode: "guest",
    localOwnerId: TEST_GUEST_OWNER_ID,
    cloudOwnerId: null,
    storagePartitionKey: `guest:${TEST_GUEST_OWNER_ID}`,
    syncPartitionKey: `guest:${TEST_GUEST_OWNER_ID}:syncQueue`,
    isMigrating: false,
  };

  const authenticatedContext: RepositoryContext = {
    accountMode: "authenticated",
    localOwnerId: TEST_GUEST_OWNER_ID,
    cloudOwnerId: TEST_CLOUD_OWNER_ID,
    storagePartitionKey: `user:${TEST_CLOUD_OWNER_ID}`,
    syncPartitionKey: `user:${TEST_CLOUD_OWNER_ID}:syncQueue`,
    isMigrating: false,
  };

  return { guestContext, authenticatedContext };
}

// ── Seed Mock Guest Data ─────────────────────────────────────────────────────────

export function seedMockGuestMigrationData(): void {
  if (!__DEV__) {
    console.warn("[MigrationTestData] Seed only runs in __DEV__ mode");
    return;
  }

  if (!mmkvStorage) {
    console.warn("[MigrationTestData] MMKV storage not available");
    return;
  }

  const { guestContext } = getMockMigrationContexts();

  console.log("[MigrationTestData] Seeding mock guest data...");

  for (const entityName of SUPPORTED_ENTITIES) {
    const key = getEntityStorageKey(entityName, guestContext);
    const mockData = generateMockEntityData(entityName);
    mmkvStorage.set(key, mockData);
    console.log(`[MigrationTestData] Seeded ${entityName} at ${key}`);
  }

  console.log("[MigrationTestData] Mock guest data seeded successfully");
}

// ── Seed Mock Guest Sync Queue ───────────────────────────────────────────────────

export function seedMockGuestSyncQueue(): void {
  if (!__DEV__) {
    console.warn("[MigrationTestData] Seed only runs in __DEV__ mode");
    return;
  }

  if (!mmkvStorage) {
    console.warn("[MigrationTestData] MMKV storage not available");
    return;
  }

  const { guestContext } = getMockMigrationContexts();
  const syncQueueKey = getSyncQueueStorageKey(guestContext);

  console.log("[MigrationTestData] Seeding mock guest sync queue...");

  const syncQueueItems: string[] = [];
  for (const entityName of SUPPORTED_ENTITIES) {
    syncQueueItems.push(generateMockSyncQueueItem(entityName, 1));
  }

  mmkvStorage!.set(syncQueueKey, JSON.stringify(syncQueueItems));
  console.log(
    `[MigrationTestData] Seeded ${syncQueueItems.length} sync queue items at ${syncQueueKey}`,
  );
}

// ── Clear Mock Migration Test Data ─────────────────────────────────────────────

export function clearMockMigrationTestData(): void {
  if (!__DEV__) {
    console.warn("[MigrationTestData] Clear only runs in __DEV__ mode");
    return;
  }

  if (!mmkvStorage) {
    console.warn("[MigrationTestData] MMKV storage not available");
    return;
  }

  const { guestContext, authenticatedContext } = getMockMigrationContexts();

  console.log("[MigrationTestData] Clearing mock migration test data...");

  // Clear guest partitions
  for (const entityName of SUPPORTED_ENTITIES) {
    const guestKey = getEntityStorageKey(entityName, guestContext);
    mmkvStorage.delete(guestKey);
    console.log(
      `[MigrationTestData] Cleared guest ${entityName} at ${guestKey}`,
    );
  }

  // Clear guest sync queue
  const guestSyncKey = getSyncQueueStorageKey(guestContext);
  mmkvStorage.delete(guestSyncKey);
  console.log(
    `[MigrationTestData] Cleared guest sync queue at ${guestSyncKey}`,
  );

  // Clear authenticated partitions (test only)
  for (const entityName of SUPPORTED_ENTITIES) {
    const authKey = getEntityStorageKey(entityName, authenticatedContext);
    mmkvStorage.delete(authKey);
    console.log(
      `[MigrationTestData] Cleared authenticated ${entityName} at ${authKey}`,
    );
  }

  // Clear authenticated sync queue (test only)
  const authSyncKey = getSyncQueueStorageKey(authenticatedContext);
  mmkvStorage.delete(authSyncKey);
  console.log(
    `[MigrationTestData] Cleared authenticated sync queue at ${authSyncKey}`,
  );

  console.log(
    "[MigrationTestData] Mock migration test data cleared successfully",
  );
}

// ── Verify Mock Data Exists ───────────────────────────────────────────────────────

export function verifyMockGuestDataExists(): boolean {
  if (!__DEV__ || !mmkvStorage) {
    return false;
  }

  const { guestContext } = getMockMigrationContexts();

  for (const entityName of SUPPORTED_ENTITIES) {
    const key = getEntityStorageKey(entityName, guestContext);
    const data = mmkvStorage.getString(key);
    if (!data) {
      return false;
    }
  }

  return true;
}

export function verifyMockSyncQueueExists(): boolean {
  if (!__DEV__ || !mmkvStorage) {
    return false;
  }

  const { guestContext } = getMockMigrationContexts();
  const syncQueueKey = getSyncQueueStorageKey(guestContext);
  const data = mmkvStorage.getString(syncQueueKey);
  return data !== null;
}
