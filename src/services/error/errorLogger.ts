/**
 * Error Logger
 * 
 * Calm, non-invasive error logging.
 * Logs errors for debugging without overwhelming users.
 */

import type { AppError, ErrorLog } from '@/types/errors';
import { createAppError } from './errorClassifier';

/**
 * Error logger class
 */
class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  /**
   * Log an error
   */
  log(error: Error | unknown, context?: Record<string, unknown>): void {
    const appError = createAppError(error, context);
    
    const logEntry: ErrorLog = {
      id: appError.id,
      error: appError,
      stackTrace: (error as Error).stack,
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
    };

    this.addLog(logEntry);

    // Log to console in development
    if (__DEV__) {
      console.log('[Error Logger]', logEntry);
    }
  }

  /**
   * Add log to storage
   */
  private addLog(log: ErrorLog): void {
    this.logs.unshift(log);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  /**
   * Get recent error logs
   */
  getRecentLogs(count = 10): ErrorLog[] {
    return this.logs.slice(0, count);
  }

  /**
   * Get error logs by severity
   */
  getLogsBySeverity(severity: string): ErrorLog[] {
    return this.logs.filter(log => log.error.severity === severity);
  }

  /**
   * Get error logs by category
   */
  getLogsByCategory(category: string): ErrorLog[] {
    return this.logs.filter(log => log.error.category === category);
  }

  /**
   * Clear all error logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    // In a real implementation, this would come from a session manager
    return 'session_' + Date.now();
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const stats = {
      total: this.logs.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    this.logs.forEach(log => {
      stats.byCategory[log.error.category] = (stats.byCategory[log.error.category] || 0) + 1;
      stats.bySeverity[log.error.severity] = (stats.bySeverity[log.error.severity] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();
