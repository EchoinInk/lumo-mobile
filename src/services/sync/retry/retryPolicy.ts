/**
 * Retry Policy
 *
 * Canonical retry rules for the sync processor.
 * Decoupled from UI, network state, and queue storage.
 *
 * Rules:
 * - Max 5 retries before dead letter
 * - Exponential backoff: 1s → 2s → 4s → 8s → 16s (capped at 30s)
 * - Jitter prevents thundering herd on reconnect
 */

import { MAX_SYNC_RETRIES } from '../config';

/** Base delay in milliseconds */
const BASE_DELAY_MS = 1000;
/** Hard cap on any single delay */
const MAX_DELAY_MS = 30_000;
/** Jitter fraction (±30%) */
const JITTER_FACTOR = 0.3;

/**
 * Calculate the delay before the next retry attempt.
 *
 * @param attempt - 0-indexed attempt number (0 = first retry)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(attempt: number): number {
  const exponential = BASE_DELAY_MS * Math.pow(2, attempt);
  const capped = Math.min(exponential, MAX_DELAY_MS);
  const jitter = capped * JITTER_FACTOR * (Math.random() * 2 - 1);
  return Math.max(0, Math.floor(capped + jitter));
}

/**
 * Check whether a retry is allowed given the current retry count.
 *
 * @param retryCount - Number of attempts already made
 */
export function canRetryAttempt(retryCount: number): boolean {
  return retryCount < MAX_SYNC_RETRIES;
}

/**
 * Check whether an item has exhausted all retries and should be dead-lettered.
 *
 * @param retryCount - Number of attempts already made
 */
export function isExhausted(retryCount: number): boolean {
  return retryCount >= MAX_SYNC_RETRIES;
}
