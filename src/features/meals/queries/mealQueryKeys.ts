/**
 * Meal Query Keys
 * 
 * Feature-specific query keys for meals.
 * Extends centralized query keys with meal-specific helpers.
 */

import { queryKeys } from '@/services/query';

export const mealQueryKeys = {
  ...queryKeys.meals,
  
  // Additional meal-specific keys
  search: (query: string) => ['meals', 'search', query] as const,
  filter: (filter: string) => ['meals', 'filter', filter] as const,
  sort: (sort: string) => ['meals', 'sort', sort] as const,
} as const;
