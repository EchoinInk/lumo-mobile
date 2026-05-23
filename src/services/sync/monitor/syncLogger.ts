/**
 * Sync Event Logger
 *
 * Structured logging system for sync operations.
 * Provides consistent, production-safe logging with dev-only verbosity.
 *
 * Format:
 *   [Sync][Entity][Operation][Status] message
 *
 * Examples:
 *   [Sync][Task][CREATE][SUCCESS] Created task_123
 *   [Sync][Recovery][RESET_FAILED] Failed to reset item queue_456
 *   [Sync][DeadLetter][Task] Moved task_789 to dead letter
 *
 * Responsibility:
 * - Centralized sync logging
 * - Consistent log format
 * - Dev-only verbose mode
 * - Production-safe (no console spam)
 */

import {
  SYNC_LOG_PREFIX,
  SYNC_VERBOSE_LOGGING,
} from '../config';

// ── Log Levels ───────────────────────────────────────────────────────────────

type LogLevel = 'info' | 'warn' | 'error';

// ── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Format log message with structured prefix.
 */
function formatMessage(
  category: string,
  entity?: string,
  operation?: string,
  status?: string
): string {
  const parts = [SYNC_LOG_PREFIX];
  
  if (category) parts.push(`[${category}]`);
  if (entity) parts.push(`[${entity}]`);
  if (operation) parts.push(`[${operation}]`);
  if (status) parts.push(`[${status}]`);
  
  return parts.join('');
}

/**
 * Log at specified level.
 */
function log(level: LogLevel, message: string, ...args: unknown[]): void {
  switch (level) {
    case 'info':
      console.log(message, ...args);
      break;
    case 'warn':
      console.warn(message, ...args);
      break;
    case 'error':
      console.error(message, ...args);
      break;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Log a sync event.
 *
 * @param category - Event category (Task, Recovery, DeadLetter, etc.)
 * @param entity - Entity type (task, habit, meal, budget)
 * @param operation - Operation type (CREATE, UPDATE, DELETE)
 * @param status - Status (SUCCESS, FAILED, PENDING)
 * @param message - Log message
 * @param args - Additional arguments for console.log
 */
export function logSyncEvent(
  category: string,
  entity: string | undefined,
  operation: string | undefined,
  status: string | undefined,
  message: string,
  ...args: unknown[]
): void {
  const prefix = formatMessage(category, entity, operation, status);
  log('info', `${prefix} ${message}`, ...args);
}

/**
 * Log a sync error.
 *
 * @param category - Error category
 * @param entity - Entity type (optional)
 * @param operation - Operation type (optional)
 * @param error - Error object or message
 * @param context - Additional context
 */
export function logSyncError(
  category: string,
  entity: string | undefined,
  operation: string | undefined,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const prefix = formatMessage(category, entity, operation, 'ERROR');
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (context && SYNC_VERBOSE_LOGGING) {
    log('error', `${prefix} ${errorMessage}`, context);
  } else {
    log('error', `${prefix} ${errorMessage}`);
  }
}

/**
 * Log a dead letter event.
 *
 * @param entity - Entity type
 * @param entityId - Entity ID
 * @param reason - Reason for dead letter
 */
export function logDeadLetter(
  entity: string,
  entityId: string,
  reason: string
): void {
  const prefix = formatMessage('DeadLetter', entity);
  log('warn', `${prefix} Moved ${entityId} to dead letter: ${reason}`);
}

/**
 * Log a recovery action.
 *
 * @param action - Recovery action type
 * @param details - Action details
 */
export function logRecoveryAction(
  action: string,
  details: Record<string, unknown>
): void {
  const prefix = formatMessage('Recovery', undefined, undefined, action);
  log('info', `${prefix}`, details);
}

/**
 * Verbose logging (dev only).
 * Only logs when SYNC_VERBOSE_LOGGING is true.
 */
export function logVerbose(message: string, ...args: unknown[]): void {
  if (SYNC_VERBOSE_LOGGING) {
    console.log(`${SYNC_LOG_PREFIX}[VERBOSE] ${message}`, ...args);
  }
}

/**
 * Log bootstrap timing.
 *
 * @param phase - Bootstrap phase
 * @param duration - Duration in milliseconds
 */
export function logBootstrapTiming(phase: string, duration: number): void {
  const prefix = formatMessage('Bootstrap');
  log('info', `${prefix} ${phase} completed in ${duration}ms`);
}
