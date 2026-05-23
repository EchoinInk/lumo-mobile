/**
 * Queue Deduplication Layer
 *
 * Idempotency key system to prevent duplicate queue execution.
 * Tracks processed events to ensure safe replays after crash.
 *
 * Architecture:
 *   Queue → Dedup Layer → Sync Processor
 *
 * Storage:
 * - MMKV key: `sync_processed_events`
 * - Stores: `Set<string>` of event keys
 * - TTL: 24 hours (events older than 24h auto-expire)
 *
 * Responsibility:
 * - Track successfully processed events
 * - Detect already-processed events
 * - Prevent duplicate writes to Supabase
 * - Safe replays after crash
 */

import { getString, setString } from "../../storage/mmkv";
import type { SyncQueueItem } from "../../storage/queue.types";
import type { SyncEvent } from "../types";
import { generateEventKey, generateEventKeyFromEvent } from "./queue.mapper";

const PROCESSED_EVENTS_KEY = "sync_processed_events_v1";
const EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ProcessedEventEntry {
  key: string;
  timestamp: number; // Unix timestamp
}

// ── Private: Storage Management ────────────────────────────────────────────

/**
 * Load processed events from MMKV.
 * Returns empty set if not found or corrupted.
 */
function loadProcessedEvents(): Map<string, number> {
  try {
    const raw = getString(PROCESSED_EVENTS_KEY);
    if (!raw) return new Map();

    const entries: ProcessedEventEntry[] = JSON.parse(raw);
    const now = Date.now();

    // Filter expired entries
    const valid = entries.filter((e) => now - e.timestamp < EVENT_TTL_MS);

    return new Map(valid.map((e) => [e.key, e.timestamp]));
  } catch {
    console.error("[QueueDedup] Failed to load processed events, resetting");
    return new Map();
  }
}

/**
 * Save processed events to MMKV.
 */
function saveProcessedEvents(events: Map<string, number>): void {
  try {
    const entries: ProcessedEventEntry[] = Array.from(events.entries()).map(
      ([key, timestamp]) => ({ key, timestamp }),
    );
    setString(PROCESSED_EVENTS_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("[QueueDedup] Failed to save processed events:", err);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Check if an event has already been processed.
 *
 * @param item - Queue item to check
 * @returns true if already processed (should be skipped)
 */
export function isEventProcessed(item: SyncQueueItem): boolean {
  const key = generateEventKey(item);
  const processed = loadProcessedEvents();

  if (!processed.has(key)) return false;

  // Check TTL
  const timestamp = processed.get(key)!;
  const now = Date.now();

  if (now - timestamp > EVENT_TTL_MS) {
    // Expired, remove and return false
    processed.delete(key);
    saveProcessedEvents(processed);
    return false;
  }

  return true;
}

/**
 * Check if a SyncEvent has already been processed.
 * Alternative for event-based checking.
 *
 * @param event - Sync event to check
 * @returns true if already processed
 */
export function isSyncEventProcessed(event: SyncEvent): boolean {
  const key = generateEventKeyFromEvent(event);
  const processed = loadProcessedEvents();

  if (!processed.has(key)) return false;

  const timestamp = processed.get(key)!;
  const now = Date.now();

  if (now - timestamp > EVENT_TTL_MS) {
    processed.delete(key);
    saveProcessedEvents(processed);
    return false;
  }

  return true;
}

/**
 * Mark an event as successfully processed.
 *
 * @param item - Queue item that was processed
 */
export function markEventProcessed(item: SyncQueueItem): void {
  const key = generateEventKey(item);
  const processed = loadProcessedEvents();

  processed.set(key, Date.now());
  saveProcessedEvents(processed);

  console.log(`[QueueDedup] Marked processed: ${key}`);
}

/**
 * Mark a SyncEvent as processed.
 * Alternative for event-based marking.
 *
 * @param event - Sync event that was processed
 */
export function markSyncEventProcessed(event: SyncEvent): void {
  const key = generateEventKeyFromEvent(event);
  const processed = loadProcessedEvents();

  processed.set(key, Date.now());
  saveProcessedEvents(processed);
}

/**
 * Clear all processed event history.
 * Use with caution — may cause duplicate writes.
 */
export function clearProcessedEvents(): void {
  setString(PROCESSED_EVENTS_KEY, "");
  console.log("[QueueDedup] Cleared all processed event history");
}

/**
 * Get count of tracked processed events.
 * For debugging/monitoring only.
 */
export function getProcessedEventCount(): number {
  return loadProcessedEvents().size;
}

/**
 * Clean up expired entries.
 * Called automatically on load, but can be called manually.
 */
export function cleanupExpiredEvents(): void {
  const processed = loadProcessedEvents();
  const now = Date.now();
  let cleaned = 0;

  for (const [key, timestamp] of processed.entries()) {
    if (now - timestamp > EVENT_TTL_MS) {
      processed.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    saveProcessedEvents(processed);
    console.log(`[QueueDedup] Cleaned up ${cleaned} expired events`);
  }
}
