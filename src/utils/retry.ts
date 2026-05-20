/**
 * Retry Utility
 *
 * Exponential backoff with jitter for resilient network operations.
 * Used by the sync queue and API services.
 */

export interface RetryOptions {
  /** Maximum number of attempts (including the first) */
  maxAttempts: number;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Whether to add random jitter to prevent thundering herd */
  jitter?: boolean;
  /** Callback invoked on each retry with attempt number and error */
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: true,
  onRetry: () => {},
};

/**
 * Calculate delay for a given attempt using exponential backoff.
 */
export function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitter: boolean
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const clampedDelay = Math.min(exponentialDelay, maxDelay);

  if (!jitter) return clampedDelay;

  // Add random jitter: 50% to 100% of the calculated delay
  return clampedDelay * (0.5 + Math.random() * 0.5);
}

/**
 * Execute an async function with exponential backoff retries.
 *
 * @example
 * const data = await withRetry(
 *   () => fetchFromSupabase(),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < config.maxAttempts - 1) {
        const delay = calculateBackoff(
          attempt,
          config.baseDelay,
          config.maxDelay,
          config.jitter
        );
        config.onRetry(attempt + 1, error);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Simple promise-based sleep utility.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
