import {
  canSafelyCleanupPartition,
  canSafelyRollbackMigration,
  createMigrationTrackingRecord,
  detectOrphanedGuestPartitions,
  getMigrationTrackingRecord,
  updateMigrationTrackingRecord,
} from "@/features/auth/services/migrationOrphanedGuestTracking";
import { getEntityStorageKey } from "@/services/storage/storagePartition";
import { storageInstance } from "@/store/storage";
import { assert, assertEqual, resetTestState } from "../testUtils";

export function testMigrationTrackingRecordCreationIsIdempotencyGuarded(): void {
  resetTestState();

  const record = createMigrationTrackingRecord(
    "guest-owner",
    "cloud-owner",
    ["guest:guest-owner:tasks"],
    ["guest:guest-owner:syncQueue"],
  );

  assertEqual(
    record.rollbackAvailable,
    true,
    "new migration records should keep rollback available",
  );

  let duplicateBlocked = false;
  try {
    createMigrationTrackingRecord("guest-owner", "cloud-owner", [], []);
  } catch {
    duplicateBlocked = true;
  }

  assert(duplicateBlocked, "duplicate migration records should be blocked");
}

export function testMigrationRollbackRequiresSnapshot(): void {
  resetTestState();
  createMigrationTrackingRecord("guest-owner", "cloud-owner", [], []);

  assertEqual(
    canSafelyRollbackMigration("guest-owner"),
    false,
    "rollback should fail closed without a snapshot",
  );

  updateMigrationTrackingRecord("guest-owner", {
    rollbackSnapshotId: "snapshot-1",
  });

  assertEqual(
    canSafelyRollbackMigration("guest-owner"),
    true,
    "rollback should be allowed when rollback metadata is intact",
  );
}

export function testMigrationCleanupRequiresValidationAndCompletedMigration(): void {
  resetTestState();
  createMigrationTrackingRecord("guest-owner", "cloud-owner", [], []);

  assertEqual(
    canSafelyCleanupPartition("guest-owner"),
    false,
    "cleanup should fail closed before validation",
  );

  updateMigrationTrackingRecord("guest-owner", {
    validationPassed: true,
    rollbackAvailable: false,
    cleanupEligible: true,
    migrationCompletedAt: Date.now(),
  });

  assertEqual(
    canSafelyCleanupPartition("guest-owner"),
    true,
    "cleanup should be allowed only after safety conditions are met",
  );
}

export function testOrphanedDetectionPreservesRollbackAvailablePartitions(): void {
  resetTestState();
  createMigrationTrackingRecord("old-guest", "cloud-owner", [], []);
  updateMigrationTrackingRecord("old-guest", {
    migrationCompletedAt: Date.now(),
    rollbackAvailable: true,
  });

  const key = getEntityStorageKey("tasks", {
    accountMode: "guest",
    localOwnerId: "old-guest",
    cloudOwnerId: undefined,
    storagePartitionKey: "guest:old-guest",
    syncPartitionKey: "guest:old-guest:syncQueue",
    isMigrating: false,
  });
  storageInstance.set(key, JSON.stringify([{ id: "task-1" }]));

  const orphaned = detectOrphanedGuestPartitions("active-guest");

  assertEqual(orphaned.length, 1, "old guest partition should be reported");
  assertEqual(
    orphaned[0]?.status,
    "rollback_available",
    "rollback-capable partitions should not be cleanup-only",
  );
  assert(
    Boolean(getMigrationTrackingRecord("old-guest")),
    "migration tracking record should remain readable",
  );
}
