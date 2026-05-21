/**
 * Task Constants
 * 
 * Feature-specific constants for tasks.
 */

export const TASK_CATEGORIES = {
  PERSONAL: 'personal',
  WORK: 'work',
  HEALTH: 'health',
  FINANCE: 'finance',
  OTHER: 'other',
} as const;

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const TASK_SORT_OPTIONS = {
  CREATED_ASC: 'created_asc',
  CREATED_DESC: 'created_desc',
  PRIORITY_ASC: 'priority_asc',
  PRIORITY_DESC: 'priority_desc',
  DUE_ASC: 'due_asc',
  DUE_DESC: 'due_desc',
} as const;
