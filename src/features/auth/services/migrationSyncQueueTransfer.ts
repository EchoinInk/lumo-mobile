/**
 * Sync Queue Transfer Preparation Utilities
 *
 * Guest → account migration sync queue transfer preparation.
 * Prepares guest-owned sync queue items for authenticated ownership after migration.
 *
 * Responsibilities:
 * - Read source guest sync queue partition
 * - Read target authenticated sync queue partition
 * - Create transfer preview
 * - Convert ownership metadata (ownerType, cloudOwnerId, syncPartitionKey, createdDuringMigration)
 * - Preserve original operation order
 * - No removal of guest queue items
 * - No replay of queue items
 * - No Supabase calls
 * - No network sync processing
 * - No deletion of guest partitions
 */

import type { RepositoryContext } from "../types/auth.types";
import { getSyncQueueStorageKey } from "../../../services/storage/storagePartition";
import { storage as mmkvStorage } from "../../../store/storage";
import type { SyncQueueItem } from "../../../services/storage/queue.types";

// ── Sync Queue Transfer Types ───────────────────────────────────────────────────

export interface SyncQueueTransferPreview {
  sourceContext: RepositoryContext;
  targetContext: RepositoryContext;
  sourceItems: SyncQueueItem[];
  targetItems: SyncQueueItem[];
  itemsToTransfer: number;
  totalSourceItems: number;
  totalTargetItems: number;
  estimatedTransferSize: number;
}

export interface SyncQueueTransferResult {
  sourceContext: RepositoryContext;
  targetContext: RepositoryContext;
  transferredItems: SyncQueueItem[];
  itemsTransferred: number;
  bytesTransferred: number;
  success: boolean;
  errors: string[];
}

export interface SyncQueueTransferValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── Sync Queue Transfer Preview ─────────────────────────────────────────────────

/**
 * Create a preview of sync queue transfer from guest to authenticated.
 * Reads both source and target sync queues and calculates transfer metrics.
 *
 * @param sourceContext - Guest repository context
 * @param targetContext - Authenticated repository context
 * @returns Sync queue transfer preview
 */
export function createSyncQueueTransferPreview(
  sourceContext: RepositoryContext,
  targetContext: RepositoryContext,
): SyncQueueTransferPreview {
  if (sourceContext.accountMode !== "guest") {
    throw new Error(
      "[SyncQueueTransfer] Source context must be in guest mode",
    );
  }

  if (targetContext.accountMode !== "authenticated") {
    throw new Error(
      "[SyncQueueTransfer] Target context must be in authenticated mode",
    );
  }

  const sourceItems = readSyncQueue(sourceContext);
  const targetItems = readSyncQueue(targetContext);

  // Filter guest items that need transfer (not already synced, not completed)
  const itemsToTransfer = sourceItems.filter(
    (item) => item.status === "pending" || item.status === "failed",
  );

  const estimatedTransferSize = calculateTransferSize(itemsToTransfer);

  return {
    sourceContext,
    targetContext,
    sourceItems,
    targetItems,
    itemsToTransfer: itemsToTransfer.length,
    totalSourceItems: sourceItems.length,
    totalTargetItems: targetItems.length,
    estimatedTransferSize,
  };
}

/**
 * Read sync queue from storage.
 */
function readSyncQueue(context: RepositoryContext): SyncQueueItem[] {
  if (!mmkvStorage) {
    return [];
  }

  const syncQueueKey = getSyncQueueStorageKey(context);
  const syncQueueData = mmkvStorage.getString(syncQueueKey);

  if (!syncQueueData) {
    return [];
  }

  try {
    const parsed = JSON.parse(syncQueueData);
    if (Array.isArray(parsed)) {
      return parsed as SyncQueueItem[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Calculate transfer size in bytes.
 */
function calculateTransferSize(items: SyncQueueItem[]): number {
  return JSON.stringify(items).length;
}

// ── Sync Queue Transfer Preparation ─────────────────────────────────────────────

/**
 * Prepare sync queue transfer by converting ownership metadata.
 * Does not remove guest queue items, does not replay items, does not call Supabase.
 *
 * @param preview - Sync queue transfer preview
 * @returns Sync queue transfer result
 */
export function prepareSyncQueueTransfer(
  preview: SyncQueueTransferPreview,
): SyncQueueTransferResult {
  if (!mmkvStorage) {
    return {
      sourceContext: preview.sourceContext,
      targetContext: preview.targetContext,
      transferredItems: [],
      itemsTransferred: 0,
      bytesTransferred: 0,
      success: false,
      errors: ["MMKV storage not available"],
    };
  }

  const errors: string[] = [];
  const transferredItems: SyncQueueItem[] = [];

  try {
    // Filter guest items that need transfer
    const sourceItems = preview.sourceItems.filter(
      (item) => item.status === "pending" || item.status === "failed",
    );

    // Convert ownership metadata for each item
    for (const item of sourceItems) {
      try {
        const convertedItem = convertOwnershipMetadata(
          item,
          preview.targetContext,
        );
        transferredItems.push(convertedItem);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to convert item ${item.id}: ${message}`);
      }
    }

    // Write converted items to target sync queue
    if (transferredItems.length > 0) {
      const targetSyncQueueKey = getSyncQueueStorageKey(preview.targetContext);
      const existingTargetItems = preview.targetItems;
      
      // Merge with existing target items, preserving order
      const mergedItems = [...existingTargetItems, ...transferredItems];
      
      mmkvStorage.set(targetSyncQueueKey, JSON.stringify(mergedItems));
    }

    const bytesTransferred = calculateTransferSize(transferredItems);
    const success = errors.length === 0;

    return {
      sourceContext: preview.sourceContext,
      targetContext: preview.targetContext,
      transferredItems,
      itemsTransferred: transferredItems.length,
      bytesTransferred,
      success,
      errors,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      sourceContext: preview.sourceContext,
      targetContext: preview.targetContext,
      transferredItems,
      itemsTransferred: transferredItems.length,
      bytesTransferred: 0,
      success: false,
      errors: [`Transfer preparation failed: ${message}`],
    };
  }
}

/**
 * Convert ownership metadata for sync queue item.
 */
function convertOwnershipMetadata(
  item: SyncQueueItem,
  targetContext: RepositoryContext,
): SyncQueueItem {
  return {
    ...item,
    ownerType: "authenticated" as const,
    localOwnerId: item.localOwnerId, // Preserve original localOwnerId
    cloudOwnerId: targetContext.cloudOwnerId, // Add cloudOwnerId
    syncPartitionKey: targetContext.syncPartitionKey, // Update syncPartitionKey
    createdDuringMigration: true, // Mark as created during migration
    // Preserve all other fields (id, entity, operation, entityId, timestamp, payload, etc.)
  };
}

// ── Sync Queue Transfer Validation ───────────────────────────────────────────────

/**
 * Validate sync queue transfer preparation.
 * Checks that converted items have correct ownership metadata.
 *
 * @param result - Sync queue transfer result
 * @returns Validation result
 */
export function validateSyncQueueTransfer(
  result: SyncQueueTransferResult,
): SyncQueueTransferValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result.success) {
    errors.push("Transfer preparation failed");
    return {
      valid: false,
      errors,
      warnings,
    };
  }

  // Validate each transferred item
  for (const item of result.transferredItems) {
    if (item.ownerType !== "authenticated") {
      errors.push(`Item ${item.id} has incorrect ownerType: ${item.ownerType}`);
    }

    if (!item.cloudOwnerId) {
      errors.push(`Item ${item.id} is missing cloudOwnerId`);
    }

    if (item.syncPartitionKey !== result.targetContext.syncPartitionKey) {
      errors.push(`Item ${item.id} has incorrect syncPartitionKey`);
    }

    if (!item.createdDuringMigration) {
      warnings.push(`Item ${item.id} is not marked as createdDuringMigration`);
    }
  }

  // Validate that original operation order is preserved
  const originalOrder = result.sourceContext.localOwnerId;
  const transferredOrder = result.transferredItems.map((item) => item.timestamp);
  
  // Check if timestamps are in ascending order (preserving original order)
  for (let i = 1; i < transferredOrder.length; i++) {
    if (transferredOrder[i] < transferredOrder[i - 1]) {
      warnings.push("Operation order may not be preserved");
      break;
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
  };
}

// ── Sync Queue Transfer Report ──────────────────────────────────────────────────

/**
 * Format sync queue transfer report for display.
 *
 * @param preview - Sync queue transfer preview
 * @param result - Sync queue transfer result
 * @param validation - Validation result
 * @returns Formatted report string
 */
export function formatSyncQueueTransferReport(
  preview: SyncQueueTransferPreview,
  result: SyncQueueTransferResult,
  validation: SyncQueueTransferValidation,
): string {
  const lines: string[] = [];

  lines.push(`Sync Queue Transfer Report`);
  lines.push(``);
  lines.push(`Source: ${preview.sourceContext.localOwnerId.slice(0, 8)}...`);
  lines.push(`Target: ${preview.targetContext.cloudOwnerId?.slice(0, 8) || "unknown"}...`);
  lines.push(``);

  lines.push(`Preview:`);
  lines.push(`  Total source items: ${preview.totalSourceItems}`);
  lines.push(`  Total target items: ${preview.totalTargetItems}`);
  lines.push(`  Items to transfer: ${preview.itemsToTransfer}`);
  lines.push(`  Estimated transfer size: ${preview.estimatedTransferSize} bytes`);
  lines.push(``);

  lines.push(`Transfer Result:`);
  lines.push(`  Items transferred: ${result.itemsTransferred}`);
  lines.push(`  Bytes transferred: ${result.bytesTransferred}`);
  lines.push(`  Success: ${result.success ? "Yes" : "No"}`);
  lines.push(``);

  if (result.errors.length > 0) {
    lines.push(`Transfer Errors:`);
    for (const error of result.errors) {
      lines.push(`  - ${error}`);
    }
    lines.push(``);
  }

  lines.push(`Validation:`);
  lines.push(`  Valid: ${validation.valid ? "Yes" : "No"}`);
  lines.push(``);

  if (validation.errors.length > 0) {
    lines.push(`Validation Errors:`);
    for (const error of validation.errors) {
      lines.push(`  - ${error}`);
    }
    lines.push(``);
  }

  if (validation.warnings.length > 0) {
    lines.push(`Validation Warnings:`);
    for (const warning of validation.warnings) {
      lines.push(`  - ${warning}`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}
