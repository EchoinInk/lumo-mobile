/**
 * Task Query Keys
 * 
 * Feature-specific query keys for tasks.
 * Extends centralized query keys with task-specific helpers.
 */

import { queryKeys } from '@/services/query';

export const taskQueryKeys = {
  ...queryKeys.tasks,
  
  // Additional task-specific keys
  search: (query: string) => ['tasks', 'search', query] as const,
  filter: (filter: string) => ['tasks', 'filter', filter] as const,
  sort: (sort: string) => ['tasks', 'sort', sort] as const,
} as const;
