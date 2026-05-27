/**
 * Focus Mode Service
 *
 * Business logic for Focus Mode operations.
 * Provides helper functions for focus mode state management.
 */

import type { CognitiveDensity } from '../types/focus.types';

/**
 * Get the recommended density based on time of day or user context.
 * This is a placeholder for future smart recommendations.
 */
export function getRecommendedDensity(): CognitiveDensity {
  const hour = new Date().getHours();
  
  // Evening hours (8pm - 10pm) suggest minimal density
  if (hour >= 20 && hour <= 22) {
    return 'minimal';
  }
  
  // Morning hours (6am - 9am) suggest comfortable density
  if (hour >= 6 && hour <= 9) {
    return 'comfortable';
  }
  
  // Default to standard
  return 'standard';
}

/**
 * Validate that a task ID exists before setting it as active focus task.
 * This is a placeholder for future validation against task store.
 */
export function validateTaskId(taskId: string | null): boolean {
  if (!taskId) {
    return true; // null is valid (no active task)
  }
  
  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(taskId);
}

/**
 * Calculate focus session duration in minutes.
 */
export function calculateFocusSessionDuration(startTime: string | null): number {
  if (!startTime) {
    return 0;
  }
  
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.floor(diffMs / 60000); // Convert to minutes
}

/**
 * Format focus duration for display.
 */
export function formatFocusDuration(minutes: number): string {
  if (minutes < 1) {
    return 'Just started';
  }
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}
