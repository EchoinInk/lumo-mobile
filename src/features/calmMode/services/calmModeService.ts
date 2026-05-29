/**
 * Calm Mode Service
 *
 * Business logic for Calm Mode operations.
 * Provides helper functions for calm mode state management.
 */

import type { EnvironmentalIntensity } from '../types/calmMode.types';

/**
 * Validate that an intensity value is valid.
 */
export function validateIntensity(intensity: string): intensity is EnvironmentalIntensity {
  return ['soft', 'balanced', 'cinematic'].includes(intensity);
}

/**
 * Calculate calm session duration in minutes.
 */
export function calculateCalmSessionDuration(startTime: string | null): number {
  if (!startTime) {
    return 0;
  }

  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.floor(diffMs / 60000); // Convert to minutes
}

/**
 * Format calm duration for display.
 */
export function formatCalmDuration(minutes: number): string {
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
