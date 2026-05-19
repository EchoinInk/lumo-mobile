import { taskLocalRepository } from '@/features/tasks/services/taskLocalRepository';

/**
 * Repository Factory
 * 
 * Centralized repository ownership for the application.
 * This allows future migration to different backends (Supabase, Firebase, etc.)
 * without touching UI code - simply swap the implementation here.
 * 
 * Usage:
 *   import { repositories } from '@/services/repositories';
 *   const tasks = await repositories.tasks.getTasks();
 */
export const repositories = {
  tasks: taskLocalRepository,
  
  // Future repositories can be added here:
  // habits: habitLocalRepository,
  // meals: mealLocalRepository,
  // budget: budgetLocalRepository,
} as const;

/**
 * Repository types for type safety
 */
export type Repositories = typeof repositories;
