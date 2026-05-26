/**
 * triggerTestError
 *
 * Development utility for triggering test errors to verify ErrorBoundary behavior.
 * Only for development/testing - no production analytics.
 *
 * Usage:
 * import { triggerTestError } from '@/utils/dev/triggerTestError';
 * triggerTestError(); // Throws an error to test ErrorBoundary
 */

export function triggerTestError() {
  if (__DEV__) {
    throw new Error("[QA] Test error triggered for ErrorBoundary verification");
  }
}

/**
 * Trigger a specific type of test error
 */
export function triggerTestErrorType(type: 'render' | 'network' | 'storage') {
  if (__DEV__) {
    switch (type) {
      case 'render':
        throw new Error("[QA] Test render error");
      case 'network':
        throw new Error("[QA] Test network error");
      case 'storage':
        throw new Error("[QA] Test storage error");
      default:
        throw new Error("[QA] Unknown test error type");
    }
  }
}
