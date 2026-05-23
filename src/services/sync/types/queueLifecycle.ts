/**
 * Queue Item Lifecycle
 *
 * Canonical state machine for sync queue items.
 * Enforces valid transitions and prevents illegal states.
 *
 * Canonical States:
 * - pending: Item created, waiting to be processed
 * - processing: Item is currently being processed (has lock)
 * - failed: Item failed processing, may retry
 * - dead_letter: Item failed after max retries, no further attempts
 * - completed: Item successfully processed, will be removed
 *
 * State Transitions:
 *   pending → processing (when processor acquires lock)
 *   processing → completed (on successful sync)
 *   processing → failed (on recoverable failure)
 *   processing → dead_letter (after retry exhaustion)
 *   failed → processing (on retry)
 *   completed → removed (cleanup, not a state)
 *
 * Illegal Transitions:
 *   completed → any state (completed is terminal)
 *   dead_letter → any state (dead_letter is terminal)
 *   pending → completed (must go through processing)
 *   processing → pending (cannot regress)
 *   failed → dead_letter (must go through processing)
 */

import type { QueueItemStatus, SyncQueueItem } from "../../storage/queue.types";

// ── Canonical States ─────────────────────────────────────────────────────────

export type QueueItemState = QueueItemStatus;

// ── State Transitions ───────────────────────────────────────────────────────

export interface StateTransition {
  from: QueueItemState;
  to: QueueItemState;
  guard: (item: SyncQueueItem) => boolean;
}

/**
 * Valid state transitions with their guards.
 */
export const VALID_TRANSITIONS: StateTransition[] = [
  {
    from: "pending",
    to: "processing",
    guard: (item) => item.status === "pending",
  },
  {
    from: "processing",
    to: "completed",
    guard: (item) => item.status === "processing",
  },
  {
    from: "processing",
    to: "failed",
    guard: (item) => item.status === "processing" && item.retryCount < 5,
  },
  {
    from: "processing",
    to: "dead_letter",
    guard: (item) => item.status === "processing" && item.retryCount >= 5,
  },
  {
    from: "failed",
    to: "processing",
    guard: (item) => item.status === "failed" && item.retryCount < 5,
  },
];

// ── Terminal States ─────────────────────────────────────────────────────────

/**
 * Terminal states that cannot transition to any other state.
 */
export const TERMINAL_STATES: Set<QueueItemState> = new Set([
  "completed",
  "dead_letter",
]);

/**
 * Check if a state is terminal.
 */
export function isTerminalState(state: QueueItemState): boolean {
  return TERMINAL_STATES.has(state);
}

// ── Transition Validation ───────────────────────────────────────────────────

/**
 * Check if a state transition is valid.
 */
export function isValidTransition(
  from: QueueItemState,
  to: QueueItemState,
): boolean {
  // Terminal states cannot transition
  if (isTerminalState(from)) {
    return false;
  }

  // Check if transition is in valid list
  return VALID_TRANSITIONS.some(
    (transition) => transition.from === from && transition.to === to,
  );
}

/**
 * Validate a state transition for a specific queue item.
 */
export function validateTransition(
  item: SyncQueueItem,
  to: QueueItemState,
): { valid: boolean; reason?: string } {
  const from = item.status;

  // Check if transition is valid
  if (!isValidTransition(from, to)) {
    return {
      valid: false,
      reason: `Invalid transition from ${from} to ${to}`,
    };
  }

  // Check transition-specific guard
  const transition = VALID_TRANSITIONS.find(
    (t) => t.from === from && t.to === to,
  );

  if (transition && !transition.guard(item)) {
    return {
      valid: false,
      reason: `Transition guard failed for ${from} → ${to}`,
    };
  }

  return { valid: true };
}

// ── State Guards ───────────────────────────────────────────────────────────

/**
 * Check if an item can be processed.
 */
export function canProcess(item: SyncQueueItem): boolean {
  return (
    item.status === "pending" ||
    (item.status === "failed" && item.retryCount < 5)
  );
}

/**
 * Check if an item can be retried.
 */
export function canRetry(item: SyncQueueItem): boolean {
  return item.status === "failed" && item.retryCount < 5;
}

/**
 * Check if an item should be moved to dead letter.
 */
export function shouldDeadLetter(item: SyncQueueItem): boolean {
  return item.status === "failed" && item.retryCount >= 5;
}

/**
 * Check if an item is orphaned (stuck in processing state).
 */
export function isOrphaned(
  item: SyncQueueItem,
  maxProcessingAgeMs: number = 300000,
): boolean {
  if (item.status !== "processing") return false;

  const processingAge = Date.now() - new Date(item.timestamp).getTime();
  return processingAge > maxProcessingAgeMs;
}

// ── Lifecycle Events ───────────────────────────────────────────────────────

export type LifecycleEvent =
  | "state_changed"
  | "retry_attempted"
  | "dead_lettered"
  | "completed"
  | "orphaned_recovered";

export interface LifecycleTransition {
  itemId: string;
  event: LifecycleEvent;
  from: QueueItemState;
  to: QueueItemState;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a lifecycle transition record.
 */
export function createLifecycleTransition(
  itemId: string,
  event: LifecycleEvent,
  from: QueueItemState,
  to: QueueItemState,
  metadata?: Record<string, unknown>,
): LifecycleTransition {
  return {
    itemId,
    event,
    from,
    to,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

// ── Invariant Guards ───────────────────────────────────────────────────────

/**
 * Check if a queue item violates invariants.
 */
export function checkInvariants(item: SyncQueueItem): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check 1: retryCount must be non-negative
  if (item.retryCount < 0) {
    violations.push("retryCount cannot be negative");
  }

  // Check 2: failed items must have retryCount > 0
  if (item.status === "failed" && item.retryCount === 0) {
    violations.push("failed items must have retryCount > 0");
  }

  // Check 3: dead_letter items must have retryCount >= 5
  if (item.status === "dead_letter" && item.retryCount < 5) {
    violations.push("dead_letter items must have retryCount >= 5");
  }

  // Check 4: completed items must have error = null
  if (item.status === "completed" && item.error !== null) {
    violations.push("completed items must have error = null");
  }

  // Check 5: processing items must have valid timestamp
  if (item.status === "processing" && !item.timestamp) {
    violations.push("processing items must have timestamp");
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Check if a queue item is in a valid state.
 */
export function isValidQueueItem(item: SyncQueueItem): boolean {
  const { valid } = checkInvariants(item);
  return valid;
}
