/**
 * Sync Retry Helper
 *
 * Simple retry logic for network and rate limit errors only.
 * No complex state machines — just delays and retries.
 *
 * Responsibility:
 * - Detect retryable errors (network, rate limit, timeout)
 * - Apply exponential backoff
 * - Give up after max attempts (caller decides what to do)
 *
 * NON-GOALS:
 * - No persistent retry state
 * - No complex backoff strategies
 * - No circuit breakers
 */

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Base delay in milliseconds */
  baseDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/**
 * Check if an error is retryable.
 * Only network errors and rate limits are retryable.
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('offline') ||
    message.includes('unreachable')
  ) {
    return true;
  }

  // Rate limiting
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('429')
  ) {
    return true;
  }

  // Server errors (may be transient)
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return true;
  }

  // Config errors are NOT retryable
  if (message.includes('not configured')) {
    return false;
  }

  // Auth errors are NOT retryable (needs user action)
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return false;
  }

  return false;
}

/**
 * Calculate delay for attempt using exponential backoff.
 */
export function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: baseDelay * 2^attempt
  const delay = config.baseDelayMs * Math.pow(2, attempt);
  // Cap at maxDelay
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Sleep for specified milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic.
 *
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @returns Result of fn()
 * @throws Last error if all retries exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === config.maxAttempts - 1) {
        throw lastError;
      }

      // Only retry retryable errors
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, config);
      console.warn(
        `[SyncRetry] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        lastError.message
      );
      await sleep(delay);
    }
  }

  // Should never reach here
  throw lastError ?? new Error('[SyncRetry] All attempts failed');
}
