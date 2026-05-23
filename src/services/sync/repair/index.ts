/**
 * Queue Repair Utilities
 *
 * Deterministic, idempotent repair operations for the sync queue.
 * Safe to run repeatedly for corrupted persistence recovery.
 *
 * Responsibilities:
 * - Repair malformed queue items
 * - Recover orphaned processing items
 * - Repair dead letters
 * - Validate queue integrity
 *
 * All operations are:
 * - Deterministic (same input → same output)
 * - Idempotent (safe to run multiple times)
 * - Non-destructive (preserves valid data)
 */

import {
  clearQueue,
  getQueueItems,
  removeItem,
  updateItemStatus,
} from "../../storage/syncQueue";
import { logRecoveryAction, logSyncEvent } from "../monitor/syncLogger";
import {
  isCorruptedItem,
  safeValidateQueueItem,
} from "../queue/queue.validation";
import { checkInvariants, isOrphaned } from "../types";

// ── Repair Result Types ─────────────────────────────────────────────────────

export interface RepairResult {
  success: boolean;
  itemsRepaired: number;
  itemsRemoved: number;
  itemsRecovered: number;
  violations: string[];
}

// ── Queue Repair ─────────────────────────────────────────────────────────

/**
 * Repair the entire sync queue.
 *
 * Removes corrupted items, recovers orphaned items, and validates integrity.
 *
 * @returns Repair result summary
 */
export function repairQueue(): RepairResult {
  const result: RepairResult = {
    success: true,
    itemsRepaired: 0,
    itemsRemoved: 0,
    itemsRecovered: 0,
    violations: [],
  };

  try {
    const items = getQueueItems();

    for (const item of items) {
      // Check for corruption
      if (isCorruptedItem(item)) {
        result.itemsRemoved++;
        removeItem(item.id);
        result.violations.push(`Corrupted item removed: ${item.id}`);
        continue;
      }

      // Check for invariant violations
      const invariantCheck = checkInvariants(item);
      if (!invariantCheck.valid) {
        result.itemsRemoved++;
        removeItem(item.id);
        result.violations.push(
          `Invariant violation: ${invariantCheck.violations.join(", ")}`,
        );
        continue;
      }

      // Recover orphaned processing items
      if (isOrphaned(item)) {
        result.itemsRecovered++;
        updateItemStatus(
          item.id,
          "pending",
          "Recovered from orphaned processing state",
        );
        logRecoveryAction("Orphaned item recovered", { itemId: item.id });
        continue;
      }

      // Validate queue item structure
      const validation = safeValidateQueueItem(item);
      if (!validation.valid) {
        result.itemsRemoved++;
        removeItem(item.id);
        result.violations.push(`Validation failed: ${validation.error}`);
        continue;
      }
    }

    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "COMPLETE",
      `Queue repair: ${result.itemsRepaired} repaired, ${result.itemsRemoved} removed, ${result.itemsRecovered} recovered`,
    );
  } catch (error) {
    result.success = false;
    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "ERROR",
      "Queue repair failed",
    );
  }

  return result;
}

// ── Dead Letter Repair ─────────────────────────────────────────────────────

/**
 * Repair dead letter items.
 *
 * Attempts to recover dead letter items by resetting retry count
 * if the error was transient (e.g., network timeout).
 *
 * @param maxAgeMs - Maximum age in ms to attempt recovery (default: 1 hour)
 * @returns Repair result summary
 */
export function repairDeadLetters(maxAgeMs: number = 3600000): RepairResult {
  const result: RepairResult = {
    success: true,
    itemsRepaired: 0,
    itemsRemoved: 0,
    itemsRecovered: 0,
    violations: [],
  };

  try {
    const items = getQueueItems();
    const now = Date.now();

    for (const item of items) {
      // Only process dead letter items
      if (item.status !== "failed" || item.retryCount < 5) {
        continue;
      }

      const itemAge = now - new Date(item.timestamp).getTime();

      // Skip old dead letters (likely permanent failures)
      if (itemAge > maxAgeMs) {
        continue;
      }

      // Check if error is transient (network-related)
      const isTransientError =
        item.error?.toLowerCase().includes("network") ||
        item.error?.toLowerCase().includes("timeout") ||
        item.error?.toLowerCase().includes("connection");

      if (isTransientError) {
        result.itemsRecovered++;
        updateItemStatus(
          item.id,
          "pending",
          "Recovered from dead letter (transient error)",
        );
        logRecoveryAction("Dead letter recovered", {
          itemId: item.id,
          error: item.error,
        });
      }
    }

    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "DEAD_LETTER_COMPLETE",
      `Dead letter repair: ${result.itemsRecovered} recovered`,
    );
  } catch (error) {
    result.success = false;
    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "ERROR",
      "Dead letter repair failed",
    );
  }

  return result;
}

// ── Orphaned Item Recovery ─────────────────────────────────────────────────

/**
 * Recover orphaned processing items.
 *
 * Items stuck in 'processing' state for too long are reset to 'pending'.
 *
 * @param maxProcessingAgeMs - Maximum age in ms before considering orphaned (default: 5 minutes)
 * @returns Repair result summary
 */
export function recoverOrphanedItems(
  maxProcessingAgeMs: number = 300000,
): RepairResult {
  const result: RepairResult = {
    success: true,
    itemsRepaired: 0,
    itemsRemoved: 0,
    itemsRecovered: 0,
    violations: [],
  };

  try {
    const items = getQueueItems();

    for (const item of items) {
      if (isOrphaned(item, maxProcessingAgeMs)) {
        result.itemsRecovered++;
        updateItemStatus(
          item.id,
          "pending",
          "Recovered from orphaned processing state",
        );
        logRecoveryAction("Orphaned item recovered", {
          itemId: item.id,
          age: maxProcessingAgeMs,
        });
      }
    }

    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "ORPHAN_COMPLETE",
      `Orphan recovery: ${result.itemsRecovered} recovered`,
    );
  } catch (error) {
    result.success = false;
    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "ERROR",
      "Orphan recovery failed",
    );
  }

  return result;
}

// ── Queue Integrity Validation ─────────────────────────────────────────────

/**
 * Validate queue integrity without making changes.
 *
 * @returns Validation result with violations
 */
export function validateQueueIntegrity(): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  try {
    const items = getQueueItems();

    for (const item of items) {
      // Check for corruption
      if (isCorruptedItem(item)) {
        violations.push(`Corrupted item: ${item.id}`);
      }

      // Check invariants
      const invariantCheck = checkInvariants(item);
      if (!invariantCheck.valid) {
        violations.push(
          `Invariant violation for ${item.id}: ${invariantCheck.violations.join(", ")}`,
        );
      }

      // Check validation
      const validation = safeValidateQueueItem(item);
      if (!validation.valid) {
        violations.push(
          `Validation failed for ${item.id}: ${validation.error}`,
        );
      }

      // Check for orphaned items
      if (isOrphaned(item)) {
        violations.push(`Orphaned processing item: ${item.id}`);
      }
    }
  } catch (error) {
    violations.push("Validation failed with error");
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// ── Emergency Queue Reset ─────────────────────────────────────────────────

/**
 * Emergency queue reset.
 *
 * WARNING: This will delete ALL queue items.
 * Use only in extreme cases where the queue is completely corrupted.
 *
 * @param confirm - Must be true to execute
 * @returns Success status
 */
export function emergencyQueueReset(confirm: boolean): boolean {
  if (!confirm) {
    console.warn("[Repair] Emergency queue reset cancelled (confirm not true)");
    return false;
  }

  try {
    clearQueue();
    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "EMERGENCY_RESET",
      "Queue completely reset",
    );
    console.warn("[Repair] Emergency queue reset executed");
    return true;
  } catch (error) {
    logSyncEvent(
      "Repair",
      undefined,
      undefined,
      "ERROR",
      "Emergency queue reset failed",
    );
    return false;
  }
}

// ── Export All Repair Functions ─────────────────────────────────────────────

export const queueRepair = {
  repairQueue,
  repairDeadLetters,
  recoverOrphanedItems,
  validateQueueIntegrity,
  emergencyQueueReset,
};
