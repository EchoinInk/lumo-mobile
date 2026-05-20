/**
 * Error Type Definitions
 * 
 * Centralized error types for graceful error handling.
 * Designed for calm, emotionally safe error recovery.
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  STORAGE = 'storage',
  AUTH = 'auth',
  VALIDATION = 'validation',
  UI = 'ui',
  SYNC = 'sync',
  UNKNOWN = 'unknown',
}

/**
 * Error recovery strategies
 */
export enum ErrorRecoveryStrategy {
  RETRY = 'retry',
  IGNORE = 'ignore',
  FALLBACK = 'fallback',
  RESET = 'reset',
  NOTIFY = 'notify',
}

/**
 * Application error interface
 */
export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoveryStrategy: ErrorRecoveryStrategy;
  userMessage?: string;
  technicalDetails?: string;
  timestamp: number;
  retryable: boolean;
  context?: Record<string, unknown>;
}

/**
 * Error log entry for persistence
 */
export interface ErrorLog {
  id: string;
  error: AppError;
  stackTrace?: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
}

/**
 * Error recovery options
 */
export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackValue?: unknown;
  onRetry?: (attempt: number) => void;
  onFailure?: (error: AppError) => void;
}

/**
 * Error classifier result
 */
export interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoveryStrategy: ErrorRecoveryStrategy;
  userMessage: string;
  retryable: boolean;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}
