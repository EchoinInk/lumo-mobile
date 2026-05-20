/**
 * Error Recovery
 * 
 * Graceful error recovery with exponential backoff.
 * Calm, non-aggressive retry logic.
 */

import type { AppError, ErrorRecoveryOptions } from '@/types/errors';
import { classifyError } from './errorClassifier';

/**
 * Execute a function with retry logic
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onFailure,
  } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const classification = classifyError(error);

      // Don't retry if error is not retryable
      if (!classification.retryable) {
        throw error;
      }

      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        if (onFailure) {
          onFailure(createAppError(error));
        }
        throw error;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      
      if (onRetry) {
        onRetry(attempt + 1);
      }

      await sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Execute a function with fallback
 */
export const withFallback = async <T>(
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    // Log error but don't throw
    console.warn('[Fallback] Using fallback due to error:', error);
    return await fallback();
  }
};

/**
 * Execute a function with graceful failure
 */
export const withGracefulFailure = async <T>(
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.warn('[Graceful Failure] Using default value due to error:', error);
    return defaultValue;
  }
};

/**
 * Sleep for a given duration
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create an AppError from an error
 */
const createAppError = (error: Error | unknown): AppError => {
  const classification = classifyError(error);
  const errorObj = error as Error;

  return {
    id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: errorObj.message || 'Unknown error',
    severity: classification.severity,
    category: classification.category,
    recoveryStrategy: classification.recoveryStrategy,
    userMessage: classification.userMessage,
    technicalDetails: errorObj.stack,
    timestamp: Date.now(),
    retryable: classification.retryable,
  };
};
