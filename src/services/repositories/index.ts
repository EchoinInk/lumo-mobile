import { taskLocalRepository } from '@/features/tasks/services/taskLocalRepository';
import { taskSyncRepository } from '@/features/tasks/services/taskSyncRepository';

/**
 * Repository Factory
 *
 * Centralized repository ownership for the application.
 * Swap implementations here — UI code never changes.
 *
 * Default: sync-aware repositories (local + queue).
 * Fallback: local-only repositories (no sync).
 *
 * Usage:
 *   import { repositories } from '@/services/repositories';
 *   const tasks = await repositories.tasks.getTasks();
 */
export const repositories = {
  /** Sync-aware: local writes + enqueues to sync queue */
  tasks: taskSyncRepository,

  /** Local-only access (useful for offline-only features or testing) */
  tasksLocal: taskLocalRepository,

  // Future repositories:
  // habits: habitSyncRepository,
  // meals: mealSyncRepository,
  // budget: budgetSyncRepository,
} as const;

/**
 * Repository types for type safety
 */
export type Repositories = typeof repositories;
