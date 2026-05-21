/**
 * Wellness Constants
 * 
 * Feature-specific constants for wellness.
 */

export const MOOD_LEVELS = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  NEUTRAL: 'neutral',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
} as const;

export const ENERGY_LEVELS = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
} as const;

export const SLEEP_QUALITY = {
  POOR: 'poor',
  FAIR: 'fair',
  GOOD: 'good',
  EXCELLENT: 'excellent',
} as const;
