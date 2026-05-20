/**
 * useRetry Hook
 * 
 * Calm retry logic with exponential backoff.
 * Non-aggressive, offline-aware retry handling.
 */

import { withRetry } from '@/services/error/errorRecovery';
import type { AppError, ErrorRecoveryOptions } from '@/types/errors';
import { ErrorCategory, ErrorRecoveryStrategy, ErrorSeverity } from '@/types/errors';
import { useCallback, useRef, useState } from 'react';

interface UseRetryOptions extends Omit<ErrorRecoveryOptions, 'onFailure'> {
  onSuccess?: () => void;
  onFailure?: (error: AppError) => void;
}

interface UseRetryReturn {
  retry: () => Promise<void>;
  isLoading: boolean;
  error: AppError | null;
  attempt: number;
  reset: () => void;
}

export const useRetry = <T>(
  fn: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const fnRef = useRef(fn);
  const optionsRef = useRef(options);

  // Update refs when values change
  fnRef.current = fn;
  optionsRef.current = options;

  const retry = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await withRetry(fnRef.current, {
        maxRetries: optionsRef.current.maxRetries ?? 3,
        retryDelay: optionsRef.current.retryDelay ?? 1000,
        onRetry: (currentAttempt) => {
          setAttempt(currentAttempt);
          optionsRef.current.onRetry?.(currentAttempt);
        },
        onFailure: (appError) => {
          setError(appError);
          optionsRef.current.onFailure?.(appError);
        },
      });

      setIsLoading(false);
      setAttempt(0);
      optionsRef.current.onSuccess?.();
    } catch (err) {
      setIsLoading(false);
      // Convert standard error to AppError
      setError({
        id: `err_${Date.now()}`,
        message: (err as Error).message || 'Unknown error',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UNKNOWN,
        recoveryStrategy: ErrorRecoveryStrategy.NOTIFY,
        timestamp: Date.now(),
        retryable: true,
      });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setAttempt(0);
  }, []);

  return {
    retry,
    isLoading,
    error,
    attempt,
    reset,
  };
};
