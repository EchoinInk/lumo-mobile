/**
 * Error Classifier
 * 
 * Classifies errors by category, severity, and recovery strategy.
 * Provides calm, appropriate user messages.
 */

import type { AppError, ErrorClassification } from '@/types/errors';
import { ErrorCategory, ErrorRecoveryStrategy, ErrorSeverity } from '@/types/errors';

/**
 * Classify an error based on its properties
 */
export const classifyError = (error: Error | unknown): ErrorClassification => {
  // Default classification
  const defaultClassification: ErrorClassification = {
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    recoveryStrategy: ErrorRecoveryStrategy.NOTIFY,
    userMessage: 'Something didn\'t work. Let\'s try that again.',
    retryable: true,
  };

  if (!error) {
    return defaultClassification;
  }

  const errorObj = error as Error;
  const message = errorObj.message?.toLowerCase() || '';

  // Network errors
  if (isNetworkError(message)) {
    return {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: ErrorRecoveryStrategy.RETRY,
      userMessage: 'Connection issue. Let\'s try again.',
      retryable: true,
    };
  }

  // Storage errors
  if (isStorageError(message)) {
    return {
      category: ErrorCategory.STORAGE,
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: ErrorRecoveryStrategy.FALLBACK,
      userMessage: 'Something went wrong saving your data. It\'s safe to try again.',
      retryable: true,
    };
  }

  // Auth errors
  if (isAuthError(message)) {
    return {
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: ErrorRecoveryStrategy.RESET,
      userMessage: 'Please sign in again to continue.',
      retryable: false,
    };
  }

  // Validation errors
  if (isValidationError(message)) {
    return {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      recoveryStrategy: ErrorRecoveryStrategy.IGNORE,
      userMessage: 'Please check your input and try again.',
      retryable: false,
    };
  }

  // Sync errors
  if (isSyncError(message)) {
    return {
      category: ErrorCategory.SYNC,
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: ErrorRecoveryStrategy.RETRY,
      userMessage: 'Sync paused. Your changes are saved locally.',
      retryable: true,
    };
  }

  return defaultClassification;
};

/**
 * Check if error is a network error
 */
const isNetworkError = (message: string): boolean => {
  const networkKeywords = [
    'network',
    'connection',
    'timeout',
    'fetch',
    'offline',
    'internet',
  ];
  return networkKeywords.some(keyword => message.includes(keyword));
};

/**
 * Check if error is a storage error
 */
const isStorageError = (message: string): boolean => {
  const storageKeywords = [
    'storage',
    'disk',
    'write',
    'save',
    'persist',
    'mmkv',
  ];
  return storageKeywords.some(keyword => message.includes(keyword));
};

/**
 * Check if error is an auth error
 */
const isAuthError = (message: string): boolean => {
  const authKeywords = [
    'auth',
    'unauthorized',
    'forbidden',
    'token',
    'session',
    'sign in',
  ];
  return authKeywords.some(keyword => message.includes(keyword));
};

/**
 * Check if error is a validation error
 */
const isValidationError = (message: string): boolean => {
  const validationKeywords = [
    'validation',
    'invalid',
    'required',
    'format',
    'schema',
  ];
  return validationKeywords.some(keyword => message.includes(keyword));
};

/**
 * Check if error is a sync error
 */
const isSyncError = (message: string): boolean => {
  const syncKeywords = [
    'sync',
    'upload',
    'download',
    'conflict',
  ];
  return syncKeywords.some(keyword => message.includes(keyword));
};

/**
 * Create an AppError from a standard Error
 */
export const createAppError = (error: Error | unknown, context?: Record<string, unknown>): AppError => {
  const classification = classifyError(error);
  const errorObj = error as Error;

  return {
    id: generateErrorId(),
    message: errorObj.message || 'Unknown error',
    severity: classification.severity,
    category: classification.category,
    recoveryStrategy: classification.recoveryStrategy,
    userMessage: classification.userMessage,
    technicalDetails: errorObj.stack,
    timestamp: Date.now(),
    retryable: classification.retryable,
    context,
  };
};

/**
 * Generate a unique error ID
 */
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
