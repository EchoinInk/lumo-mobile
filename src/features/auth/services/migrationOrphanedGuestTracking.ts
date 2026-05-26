/**
 * Orphaned Guest Partition Tracking Utilities
 *
 * Guest → account migration orphaned partition tracking.
 * Tracks migrated/orphaned guest partitions safely after migration without deleting anything.
 *
 * This is a safety + observability layer only.
 *
 * Responsibilities:
 * - Identify orphaned guest partitions
 * - Identify migrated guest partitions
 * - Identify stale guest partitions
 * - Track migration timestamps
 * - Support future cleanup phases safely
 * - Preserve rollback capability
 *
 * Does NOT:
 * - Delete guest partitions
 * - Clear MMKV globally
 * - Replay sync queues
 * - Upload anything to Supabase
 * - Mutate authenticated data
 * - Perform destructive cleanup
 * - Auto-remove orphaned partitions
 */

import {
    getEntityStorageKey,
    getSyncQueueStorageKey,
} from "../../../services/storage/storagePartition";
import { storageInstance as mmkvStorage } from "../../../store/storage";

// ── Tracking Types ─────────────────────────────────────────────────────────────

export type GuestPartitionStatus =
  | "active"
  | "migrated"
  | "orphaned"
  | "rollback_available"
  | "cleanup_candidate";

export interface OrphanedGuestPartition {
  localOwnerId: string;
  partitionKey: string;
  entityName: string;
  status: GuestPartitionStatus;
  dataSize: number;
  itemCount: number;
  createdAt: number;
  lastAccessedAt: number;
  migrationTimestamp?: number;
  cloudOwnerId?: string;
}

export interface MigrationTrackingRecord {
  localOwnerId: string;
  cloudOwnerId?: string;
  migrationStartedAt: number;
  migrationCompletedAt?: number;
  rollbackAvailable: boolean;
  cleanupEligible: boolean;
  migratedPartitions: string[];
  migratedSyncPartitions: string[];
  validationPassed: boolean;
  migrationVersion: string;
  rollbackSnapshotId?: string;
}

export interface OrphanedPartitionReport {
  activeGuestPartitions: OrphanedGuestPartition[];
  orphanedPartitions: OrphanedGuestPartition[];
  migratedPartitions: OrphanedGuestPartition[];
  rollbackAvailablePartitions: OrphanedGuestPartition[];
  cleanupCandidates: OrphanedGuestPartition[];
  migrationRecords: MigrationTrackingRecord[];
  totalStorageUsage: number;
  reportGeneratedAt: number;
}

export interface GuestPartitionCleanupCandidate {
  partition: OrphanedGuestPartition;
  estimatedStorageUsage: number;
  migrationAge: number;
  rollbackEligible: boolean;
  cleanupEligible: boolean;
  reason: string;
}

// ── Supported Entities ───────────────────────────────────────────────────────────

const SUPPORTED_ENTITIES = [
  "tasks",
  "habits",
  "meals",
  "budget",
  "workouts",
  "calendar",
] as const;

// ── Migration Tracking Storage ─────────────────────────────────────────────────

const MIGRATION_TRACKING_KEY = "auth_migration_tracking_v1";

// ── Guest Partition Discovery ───────────────────────────────────────────────────

/**
 * Discover guest partitions by inspecting known partition keys.
 * Groups partitions by localOwnerId.
 *
 * @param activeLocalOwnerId - Current active local owner ID
 * @returns Discovered guest partitions grouped by localOwnerId
 */
export function discoverGuestPartitions(
  activeLocalOwnerId: string,
): Map<string, OrphanedGuestPartition[]> {
  const partitionsByOwner = new Map<string, OrphanedGuestPartition[]>();

  if (!mmkvStorage) {
    return partitionsByOwner;
  }

  // Scan all possible guest partition keys using deterministic keys
  for (const entityName of SUPPORTED_ENTITIES) {
    // We can't iterate all localOwnerIds without unsafe MMKV iteration
    // Instead, we'll check known migration tracking records for discovered localOwnerIds
    const trackingRecords = getAllMigrationTrackingRecords();

    for (const record of trackingRecords) {
      const partitions = partitionsByOwner.get(record.localOwnerId) || [];

      // Check entity partition
      const entityKey = getEntityStorageKey(entityName, {
        accountMode: "guest",
        localOwnerId: record.localOwnerId,
        storagePartitionKey: `guest:${record.localOwnerId}`,
        syncPartitionKey: `guest:${record.localOwnerId}:syncQueue`,
        isMigrating: false,
      });

      const entityData = mmkvStorage.getString(entityKey);
      if (entityData) {
        partitions.push({
          localOwnerId: record.localOwnerId,
          partitionKey: entityKey,
          entityName,
          status:
            record.localOwnerId === activeLocalOwnerId ? "active" : "migrated",
          dataSize: entityData.length,
          itemCount: parseItemCount(entityData),
          createdAt: record.migrationStartedAt,
          lastAccessedAt:
            record.migrationCompletedAt || record.migrationStartedAt,
          migrationTimestamp: record.migrationCompletedAt,
          cloudOwnerId: record.cloudOwnerId,
        });
      }

      partitionsByOwner.set(record.localOwnerId, partitions);
    }
  }

  // Check sync queue partitions
  const trackingRecords = getAllMigrationTrackingRecords();
  for (const record of trackingRecords) {
    const partitions = partitionsByOwner.get(record.localOwnerId) || [];

    const syncQueueKey = getSyncQueueStorageKey({
      accountMode: "guest",
      localOwnerId: record.localOwnerId,
      storagePartitionKey: `guest:${record.localOwnerId}`,
      syncPartitionKey: `guest:${record.localOwnerId}:syncQueue`,
      isMigrating: false,
    });

    const syncQueueData = mmkvStorage.getString(syncQueueKey);
    if (syncQueueData) {
      partitions.push({
        localOwnerId: record.localOwnerId,
        partitionKey: syncQueueKey,
        entityName: "syncQueue",
        status:
          record.localOwnerId === activeLocalOwnerId ? "active" : "migrated",
        dataSize: syncQueueData.length,
        itemCount: parseItemCount(syncQueueData),
        createdAt: record.migrationStartedAt,
        lastAccessedAt:
          record.migrationCompletedAt || record.migrationStartedAt,
        migrationTimestamp: record.migrationCompletedAt,
        cloudOwnerId: record.cloudOwnerId,
      });
    }

    partitionsByOwner.set(record.localOwnerId, partitions);
  }

  return partitionsByOwner;
}

/**
 * Parse item count from JSON data.
 */
function parseItemCount(jsonData: string): number {
  try {
    const parsed = JSON.parse(jsonData);
    if (Array.isArray(parsed)) {
      return parsed.length;
    }
    if (typeof parsed === "object" && parsed !== null) {
      return Object.keys(parsed).length;
    }
    return 1;
  } catch {
    return 0;
  }
}

// ── Orphaned Partition Detection ───────────────────────────────────────────────

/**
 * Detect orphaned guest partitions.
 * A partition is orphaned when:
 * - localOwnerId no longer matches active guest session
 * - no authenticated ownership exists
 * - migration incomplete or abandoned
 * - rollback still possible
 *
 * @param activeLocalOwnerId - Current active local owner ID
 * @returns Orphaned guest partitions
 */
export function detectOrphanedGuestPartitions(
  activeLocalOwnerId: string,
): OrphanedGuestPartition[] {
  const partitionsByOwner = discoverGuestPartitions(activeLocalOwnerId);
  const orphaned: OrphanedGuestPartition[] = [];

  for (const [localOwnerId, partitions] of partitionsByOwner.entries()) {
    // Skip active guest partitions
    if (localOwnerId === activeLocalOwnerId) {
      continue;
    }

    const trackingRecord = getMigrationTrackingRecord(localOwnerId);

    for (const partition of partitions) {
      // Partition is orphaned if:
      // - No tracking record exists (abandoned migration)
      // - Migration incomplete (no completion timestamp)
      // - Rollback still available
      if (!trackingRecord) {
        partition.status = "orphaned";
        orphaned.push(partition);
      } else if (!trackingRecord.migrationCompletedAt) {
        partition.status = "orphaned";
        orphaned.push(partition);
      } else if (trackingRecord.rollbackAvailable) {
        partition.status = "rollback_available";
        orphaned.push(partition);
      } else if (trackingRecord.cleanupEligible) {
        partition.status = "cleanup_candidate";
        orphaned.push(partition);
      } else {
        partition.status = "migrated";
      }
    }
  }

  return orphaned;
}

// ── Migration Tracking Records ─────────────────────────────────────────────────

/**
 * Create a migration tracking record.
 *
 * @param localOwnerId - Local owner ID
 * @param cloudOwnerId - Cloud owner ID (optional)
 * @param migratedPartitions - List of migrated partition keys
 * @param migratedSyncPartitions - List of migrated sync partition keys
 * @returns Created migration tracking record
 */
export function createMigrationTrackingRecord(
  localOwnerId: string,
  cloudOwnerId: string | undefined,
  migratedPartitions: string[],
  migratedSyncPartitions: string[],
): MigrationTrackingRecord {
  const existingRecord = getMigrationTrackingRecord(localOwnerId);

  if (existingRecord) {
    throw new Error(
      `[OrphanedTracking] Migration tracking record already exists for ${localOwnerId}`,
    );
  }

  const record: MigrationTrackingRecord = {
    localOwnerId,
    cloudOwnerId,
    migrationStartedAt: Date.now(),
    migrationCompletedAt: undefined,
    rollbackAvailable: true,
    cleanupEligible: false,
    migratedPartitions,
    migratedSyncPartitions,
    validationPassed: false,
    migrationVersion: "1.0.0",
  };

  saveMigrationTrackingRecord(record);
  return record;
}

/**
 * Update a migration tracking record.
 *
 * @param localOwnerId - Local owner ID
 * @param updates - Partial updates to apply
 * @returns Updated migration tracking record
 */
export function updateMigrationTrackingRecord(
  localOwnerId: string,
  updates: Partial<MigrationTrackingRecord>,
): MigrationTrackingRecord {
  const existingRecord = getMigrationTrackingRecord(localOwnerId);

  if (!existingRecord) {
    throw new Error(
      `[OrphanedTracking] Migration tracking record not found for ${localOwnerId}`,
    );
  }

  const updatedRecord: MigrationTrackingRecord = {
    ...existingRecord,
    ...updates,
  };

  // Safety guard: prevent clearing critical fields
  if (!updatedRecord.migrationStartedAt) {
    throw new Error("[OrphanedTracking] Cannot clear migrationStartedAt");
  }

  saveMigrationTrackingRecord(updatedRecord);
  return updatedRecord;
}

/**
 * Get a migration tracking record by local owner ID.
 *
 * @param localOwnerId - Local owner ID
 * @returns Migration tracking record or undefined
 */
export function getMigrationTrackingRecord(
  localOwnerId: string,
): MigrationTrackingRecord | undefined {
  if (!mmkvStorage) {
    return undefined;
  }

  const trackingData = mmkvStorage.getString(MIGRATION_TRACKING_KEY);
  if (!trackingData) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trackingData);
    if (Array.isArray(parsed)) {
      return parsed.find((r) => r.localOwnerId === localOwnerId);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get all migration tracking records.
 *
 * @returns All migration tracking records
 */
function getAllMigrationTrackingRecords(): MigrationTrackingRecord[] {
  if (!mmkvStorage) {
    return [];
  }

  const trackingData = mmkvStorage.getString(MIGRATION_TRACKING_KEY);
  if (!trackingData) {
    return [];
  }

  try {
    const parsed = JSON.parse(trackingData);
    if (Array.isArray(parsed)) {
      return parsed as MigrationTrackingRecord[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save a migration tracking record to storage.
 */
function saveMigrationTrackingRecord(record: MigrationTrackingRecord): void {
  if (!mmkvStorage) {
    return;
  }

  const trackingData = mmkvStorage.getString(MIGRATION_TRACKING_KEY);
  let records: MigrationTrackingRecord[] = [];

  if (trackingData) {
    try {
      const parsed = JSON.parse(trackingData);
      if (Array.isArray(parsed)) {
        records = parsed as MigrationTrackingRecord[];
      }
    } catch {
      // Ignore parse errors, start fresh
    }
  }

  // Update or add record
  const existingIndex = records.findIndex(
    (r) => r.localOwnerId === record.localOwnerId,
  );
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  mmkvStorage.set(MIGRATION_TRACKING_KEY, JSON.stringify(records));
}

// ── Cleanup Candidate Detection ─────────────────────────────────────────────────

/**
 * Get cleanup candidates for orphaned guest partitions.
 * Cleanup candidates are NOT auto-deleted, only marked as candidates.
 *
 * @param activeLocalOwnerId - Current active local owner ID
 * @returns Cleanup candidates
 */
export function getCleanupCandidates(
  activeLocalOwnerId: string,
): GuestPartitionCleanupCandidate[] {
  const orphanedPartitions = detectOrphanedGuestPartitions(activeLocalOwnerId);
  const candidates: GuestPartitionCleanupCandidate[] = [];

  for (const partition of orphanedPartitions) {
    const trackingRecord = getMigrationTrackingRecord(partition.localOwnerId);

    if (!trackingRecord) {
      // No tracking record - cannot safely cleanup
      continue;
    }

    // Cleanup eligibility rules:
    // - Successful validation
    // - Rollback window elapsed (7 days)
    // - Migration completed
    // - No active session ownership
    // - No pending sync transfer state
    const rollbackWindowElapsed = trackingRecord.migrationCompletedAt
      ? Date.now() - trackingRecord.migrationCompletedAt >
        7 * 24 * 60 * 60 * 1000
      : false;

    const validationPassed = trackingRecord.validationPassed;
    const migrationCompleted = !!trackingRecord.migrationCompletedAt;
    const noActiveOwnership = partition.localOwnerId !== activeLocalOwnerId;
    const noPendingSyncTransfer = !trackingRecord.rollbackAvailable;

    const cleanupEligible =
      validationPassed &&
      rollbackWindowElapsed &&
      migrationCompleted &&
      noActiveOwnership &&
      noPendingSyncTransfer;

    const migrationAge = trackingRecord.migrationCompletedAt
      ? Date.now() - trackingRecord.migrationCompletedAt
      : 0;

    candidates.push({
      partition,
      estimatedStorageUsage: partition.dataSize,
      migrationAge,
      rollbackEligible: trackingRecord.rollbackAvailable,
      cleanupEligible,
      reason: cleanupEligible
        ? "All cleanup criteria met"
        : "Waiting for rollback window or validation",
    });
  }

  return candidates;
}

// ── Rollback-Safe Checks ───────────────────────────────────────────────────────

/**
 * Check if migration can be safely rolled back.
 *
 * @param localOwnerId - Local owner ID
 * @returns Whether rollback is safe
 */
export function canSafelyRollbackMigration(localOwnerId: string): boolean {
  const trackingRecord = getMigrationTrackingRecord(localOwnerId);

  if (!trackingRecord) {
    return false;
  }

  // Rollback is safe if:
  // - Rollback snapshot exists
  // - Migration not already rolled back
  // - No cleanup has occurred
  return (
    trackingRecord.rollbackAvailable &&
    !!trackingRecord.rollbackSnapshotId &&
    !trackingRecord.cleanupEligible
  );
}

/**
 * Check if partition can be safely cleaned up.
 *
 * @param localOwnerId - Local owner ID
 * @returns Whether cleanup is safe
 */
export function canSafelyCleanupPartition(localOwnerId: string): boolean {
  const trackingRecord = getMigrationTrackingRecord(localOwnerId);

  if (!trackingRecord) {
    return false;
  }

  // Cleanup must fail closed:
  // - Not during active migration
  // - Not during pending sync transfer
  // - Not with failed validation
  // - Not with missing migration records
  // - Rollback safety prioritized over storage cleanup
  return (
    trackingRecord.validationPassed &&
    !trackingRecord.rollbackAvailable &&
    trackingRecord.cleanupEligible &&
    !!trackingRecord.migrationCompletedAt
  );
}

// ── Reporting Utilities ───────────────────────────────────────────────────────

/**
 * Format orphaned partition report for debugging/logging.
 *
 * @param activeLocalOwnerId - Current active local owner ID
 * @returns Formatted report string
 */
export function formatOrphanedPartitionReport(
  activeLocalOwnerId: string,
): string {
  const partitionsByOwner = discoverGuestPartitions(activeLocalOwnerId);
  const orphanedPartitions = detectOrphanedGuestPartitions(activeLocalOwnerId);
  const cleanupCandidates = getCleanupCandidates(activeLocalOwnerId);
  const trackingRecords = getAllMigrationTrackingRecords();

  const activeGuestPartitions: OrphanedGuestPartition[] = [];
  const migratedPartitions: OrphanedGuestPartition[] = [];
  const rollbackAvailablePartitions: OrphanedGuestPartition[] = [];

  for (const partitions of partitionsByOwner.values()) {
    for (const partition of partitions) {
      if (partition.status === "active") {
        activeGuestPartitions.push(partition);
      } else if (partition.status === "migrated") {
        migratedPartitions.push(partition);
      } else if (partition.status === "rollback_available") {
        rollbackAvailablePartitions.push(partition);
      }
    }
  }

  const totalStorageUsage = [...partitionsByOwner.values()]
    .flat()
    .reduce((sum, p) => sum + p.dataSize, 0);

  const report: OrphanedPartitionReport = {
    activeGuestPartitions,
    orphanedPartitions,
    migratedPartitions,
    rollbackAvailablePartitions,
    cleanupCandidates: cleanupCandidates.map((c) => c.partition),
    migrationRecords: trackingRecords,
    totalStorageUsage,
    reportGeneratedAt: Date.now(),
  };

  return formatReport(report);
}

/**
 * Format orphaned partition report.
 */
function formatReport(report: OrphanedPartitionReport): string {
  const lines: string[] = [];

  lines.push(`Orphaned Guest Partition Report`);
  lines.push(
    `Generated at: ${new Date(report.reportGeneratedAt).toISOString()}`,
  );
  lines.push(``);

  lines.push(`Active Guest Partitions: ${report.activeGuestPartitions.length}`);
  for (const partition of report.activeGuestPartitions) {
    lines.push(
      `  - ${partition.entityName} (${partition.localOwnerId.slice(0, 8)}...): ${partition.dataSize} bytes`,
    );
  }
  lines.push(``);

  lines.push(`Orphaned Partitions: ${report.orphanedPartitions.length}`);
  for (const partition of report.orphanedPartitions) {
    lines.push(
      `  - ${partition.entityName} (${partition.localOwnerId.slice(0, 8)}...): ${partition.status} - ${partition.dataSize} bytes`,
    );
  }
  lines.push(``);

  lines.push(`Migrated Partitions: ${report.migratedPartitions.length}`);
  for (const partition of report.migratedPartitions) {
    lines.push(
      `  - ${partition.entityName} (${partition.localOwnerId.slice(0, 8)}...): ${partition.dataSize} bytes`,
    );
  }
  lines.push(``);

  lines.push(
    `Rollback Available Partitions: ${report.rollbackAvailablePartitions.length}`,
  );
  for (const partition of report.rollbackAvailablePartitions) {
    lines.push(
      `  - ${partition.entityName} (${partition.localOwnerId.slice(0, 8)}...): ${partition.dataSize} bytes`,
    );
  }
  lines.push(``);

  lines.push(`Cleanup Candidates: ${report.cleanupCandidates.length}`);
  for (const partition of report.cleanupCandidates) {
    lines.push(
      `  - ${partition.entityName} (${partition.localOwnerId.slice(0, 8)}...): ${partition.dataSize} bytes`,
    );
  }
  lines.push(``);

  lines.push(`Migration Records: ${report.migrationRecords.length}`);
  for (const record of report.migrationRecords) {
    lines.push(`  - ${record.localOwnerId.slice(0, 8)}...:`);
    lines.push(
      `    Started: ${new Date(record.migrationStartedAt).toISOString()}`,
    );
    lines.push(
      `    Completed: ${record.migrationCompletedAt ? new Date(record.migrationCompletedAt).toISOString() : "Pending"}`,
    );
    lines.push(
      `    Validation: ${record.validationPassed ? "Passed" : "Failed"}`,
    );
    lines.push(
      `    Rollback Available: ${record.rollbackAvailable ? "Yes" : "No"}`,
    );
    lines.push(
      `    Cleanup Eligible: ${record.cleanupEligible ? "Yes" : "No"}`,
    );
  }
  lines.push(``);

  lines.push(`Total Storage Usage: ${report.totalStorageUsage} bytes`);

  return lines.join("\n");
}
