/**
 * Habit Query Keys
 * 
 * Feature-specific query keys for habits.
 * Extends centralized query keys with habit-specific helpers.
 */

import { queryKeys } from '@/services/query';

export const habitQueryKeys = {
  ...queryKeys.habits,
  
  // Additional habit-specific keys
  search: (query: string) => ['habits', 'search', query] as const,
  filter: (filter: string) => ['habits', 'filter', filter] as const,
  sort: (sort: string) => ['habits', 'sort', sort] as const,
} as const;
