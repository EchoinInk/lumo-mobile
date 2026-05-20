/**
 * useAsyncBoundary Hook
 * 
 * Async error boundary for async operations.
 * Graceful error handling with fallback support.
 */

import { useState, useCallback } from 'react';
import { errorLogger } from '@/services/error/errorLogger';
import type { AppError } from '@/types/errors';

interface AsyncBoundaryState {
  isLoading: boolean;
  error: AppError | null;
  data: unknown;
}

interface UseAsyncBoundaryReturn {
  state: AsyncBoundaryState;
  execute: <T>(fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export const useAsyncBoundary = (): UseAsyncBoundaryReturn => {
  const [state, setState] = useState<AsyncBoundaryState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setState({ isLoading: true, error: null, data: null });

    try {
      const result = await fn();
      setState({ isLoading: false, error: null, data: result });
      return result;
    } catch (error) {
      // Log error for debugging
      errorLogger.log(error);

      setState({
        isLoading: false,
        error: error as AppError,
        data: null,
      });

      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    state,
    execute,
    reset,
  };
};
