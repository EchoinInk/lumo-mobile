/**
 * Dead Letter Queue
 *
 * Permanent store for queue items that have exhausted all retries
 * or encountered non-retryable errors.
 *
 * Rules:
 * - Items are NEVER silently deleted — always archived here first
 * - Dead letter items are inspectable for diagnostics and repair
 * - Dead letter storage is separate from the main sync queue
 * - Items can be manually replayed via the repair system
 *
 * Storage key: sync_dead_letter_v1 (defined in config)
 */

import { getString, setString } from "../../storage/mmkv";
import type { SyncQueueItem } from "../../storage/queue.types";
import { DEAD_LETTER_STORAGE_KEY } from "../config";

// ── Types ─────────────────────────────────────────────────────────────────

export interface DeadLetterEntry {
  /** Original queue item snapshot at time of archival */
  item: SyncQueueItem;
  /** ISO timestamp when item was archived */
  archivedAt: string;
  /** Reason for archival */
  reason: string;
}

// ── Storage helpers ───────────────────────────────────────────────────────

function loadDeadLetters(): DeadLetterEntry[] {
  try {
    const raw = getString(DEAD_LETTER_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DeadLetterEntry[];
  } catch {
    console.error("[DeadLetter] Failed to load dead letter store, resetting");
    return [];
  }
}

function persistDeadLetters(entries: DeadLetterEntry[]): void {
  try {
    setString(DEAD_LETTER_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("[DeadLetter] Failed to persist dead letter store:", err);
  }
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Archive a queue item into the dead letter store.
 * Called by the sync processor when an item cannot be retried.
 *
 * @param item   - The queue item that failed permanently
 * @param reason - Human-readable reason for archival
 */
export function archiveDeadLetter(item: SyncQueueItem, reason: string): void {
  const entries = loadDeadLetters();

  const entry: DeadLetterEntry = {
    item: { ...item },
    archivedAt: new Date().toISOString(),
    reason,
  };

  entries.push(entry);
  persistDeadLetters(entries);

  console.warn(
    `[DeadLetter] Archived ${item.entity}:${item.operation} (${item.entityId}) — ${reason}`,
  );
}

/**
 * Get all dead letter entries.
 * For diagnostics and repair tooling only.
 */
export function getDeadLetters(): DeadLetterEntry[] {
  return loadDeadLetters();
}

/**
 * Get dead letter entries for a specific entity.
 */
export function getDeadLettersByEntity(entity: string): DeadLetterEntry[] {
  return loadDeadLetters().filter((e) => e.item.entity === entity);
}

/**
 * Get dead letter entries for a specific user.
 * TODO: Phase 13.2 - Update to use new ownership metadata (localOwnerId/cloudOwnerId)
 */
export function getDeadLettersByUser(userId: string): DeadLetterEntry[] {
  // Temporary compatibility: check both old userId and new ownership fields
  return loadDeadLetters().filter(
    (e) =>
      // @ts-ignore - Temporary compatibility for userId during migration
      (e.item as any).userId === userId ||
      e.item.localOwnerId === userId ||
      e.item.cloudOwnerId === userId,
  );
}

/**
 * Get count of dead letter entries.
 */
export function getDeadLetterCount(): number {
  return loadDeadLetters().length;
}

/**
 * Remove a specific dead letter entry by queue item ID.
 * Used by repair tooling after successful replay.
 */
export function removeDeadLetter(itemId: string): void {
  const entries = loadDeadLetters().filter((e) => e.item.id !== itemId);
  persistDeadLetters(entries);
}

/**
 * Clear all dead letter entries.
 * Use with extreme caution — data cannot be recovered.
 */
export function clearDeadLetters(): void {
  persistDeadLetters([]);
  console.warn("[DeadLetter] Dead letter store cleared");
}
