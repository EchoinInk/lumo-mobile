/**
 * Sync Configuration
 *
 * Centralized configuration for sync system behavior.
 * All retry, backoff, and operational constants live here.
 *
 * Responsibility:
 * - Single source of truth for sync configuration
 * - Easy tuning of retry/backoff behavior
 * - Consistent limits across the system
 */

// ── Retry Configuration ───────────────────────────────────────────────────────

/** Maximum retry attempts before marking as failed (dead letter) */
export const MAX_SYNC_RETRIES = 5;

/** Base delay in milliseconds for exponential backoff */
export const SYNC_RETRY_BASE_DELAY = 1000;

/** Maximum delay in milliseconds for exponential backoff */
export const SYNC_RETRY_MAX_DELAY = 30000;

/** Jitter factor for retry delays (30% random variation to avoid thundering herd) */
export const SYNC_RETRY_JITTER_FACTOR = 0.3;

// ── Processing Configuration ───────────────────────────────────────────────────

/** Maximum number of queue items to process in a single batch */
export const SYNC_BATCH_SIZE = 10;

/** Delay between batch processing cycles (in milliseconds) */
export const SYNC_BATCH_DELAY = 100;

// ── Dead Letter Configuration ──────────────────────────────────────────────────

/** Storage key for dead letter queue */
export const DEAD_LETTER_STORAGE_KEY = 'sync_dead_letter_v1';

// ── Dedup Configuration ───────────────────────────────────────────────────────

/** Storage key for deduplication tracking */
export const DEDUP_STORAGE_KEY = 'sync_dedup_v1';

/** Time-to-live for dedup entries (in milliseconds) - 24 hours */
export const DEDUP_TTL_MS = 24 * 60 * 60 * 1000;

// ── Health Check Configuration ─────────────────────────────────────────────────

/** Threshold for excessive failures (percentage) */
export const HEALTH_FAILURE_THRESHOLD = 0.5;

// ── Logging Configuration ─────────────────────────────────────────────────────

/** Log prefix for all sync-related logs */
export const SYNC_LOG_PREFIX = '[Sync]';

/** Enable verbose logging in development only */
export const SYNC_VERBOSE_LOGGING = __DEV__;
