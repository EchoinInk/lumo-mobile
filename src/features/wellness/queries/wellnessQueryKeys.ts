/**
 * Wellness Query Keys
 * 
 * Feature-specific query keys for wellness.
 * Extends centralized query keys with wellness-specific helpers.
 */

import { queryKeys } from '@/services/query';

export const wellnessQueryKeys = {
  ...queryKeys.wellness,
  
  // Additional wellness-specific keys
  byDate: (date: string) => ['wellness', 'date', date] as const,
  byRange: (start: string, end: string) => ['wellness', 'range', start, end] as const,
} as const;
