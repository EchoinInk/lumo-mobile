/**
 * Result Types
 *
 * Standardized error handling architecture for the entire app.
 * Unified Result<T> pattern replaces try/catch chaos with
 * explicit, type-safe error handling.
 *
 * Usage:
 *   const result = await someOperation();
 *   if (result.error) {
 *     handleError(result.error);
 *     return;
 *   }
 *   useTheData(result.data);
 */

/**
 * Standard result type for all operations that can fail.
 * Either data is present (success) or error is present (failure).
 * Never both, never neither.
 */
export type Result<T> = {
  /** The successful result data, null if error occurred */
  data: T | null;
  /** Error message if operation failed, null on success */
  error: string | null;
};

/**
 * Async variant of Result<T> for promises.
 * Use as return type for async functions.
 */
export type AsyncResult<T> = Promise<Result<T>>;

/**
 * Result with typed error for more specific error handling.
 */
export type ResultWithError<T, E = string> = {
  data: T | null;
  error: E | null;
};

/**
 * Helper to create a successful Result.
 */
export function ok<T>(data: T): Result<T> {
  return { data, error: null };
}

/**
 * Helper to create a failed Result.
 */
export function err<T>(error: string): Result<T> {
  return { data: null, error };
}

/**
 * Type guard to check if result is successful.
 */
export function isOk<T>(result: Result<T>): result is { data: T; error: null } {
  return result.error === null && result.data !== null;
}

/**
 * Type guard to check if result failed.
 */
export function isErr<T>(result: Result<T>): result is { data: null; error: string } {
  return result.error !== null;
}

/**
 * Unwrap a result, returning data or throwing error.
 * Use sparingly — prefer explicit error handling.
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.error) {
    throw new Error(result.error);
  }
  if (result.data === null) {
    throw new Error('Unwrapped null data with no error');
  }
  return result.data;
}

/**
 * Unwrap with a default value on error.
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return result.data ?? defaultValue;
}

/**
 * Map a successful result to a new type.
 */
export function map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  if (result.error) {
    return { data: null, error: result.error };
  }
  if (result.data === null) {
    return { data: null, error: 'Cannot map null data' };
  }
  return { data: fn(result.data), error: null };
}

/**
 * Map an error to a new error message.
 */
export function mapError<T>(result: Result<T>, fn: (error: string) => string): Result<T> {
  if (result.error) {
    return { data: result.data, error: fn(result.error) };
  }
  return result;
}
