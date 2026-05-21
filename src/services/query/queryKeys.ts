/**
 * Centralized Query Keys
 * 
 * Typed, composable, scalable query key system.
 * Feature-safe, predictable invalidation.
 */

export const queryKeys = {
  // App lifecycle
  app: {
    all: ['app'] as const,
    status: () => ['app', 'status'] as const,
  },
  
  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => ['auth', 'session'] as const,
    user: () => ['auth', 'user'] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => ['tasks', 'list'] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    byCategory: (category: string) => ['tasks', 'category', category] as const,
    byStatus: (status: string) => ['tasks', 'status', status] as const,
  },
  
  // Habits
  habits: {
    all: ['habits'] as const,
    lists: () => ['habits', 'list'] as const,
    detail: (id: string) => ['habits', 'detail', id] as const,
    byFrequency: (frequency: string) => ['habits', 'frequency', frequency] as const,
  },
  
  // Meals
  meals: {
    all: ['meals'] as const,
    lists: () => ['meals', 'list'] as const,
    detail: (id: string) => ['meals', 'detail', id] as const,
    byDate: (date: string) => ['meals', 'date', date] as const,
  },
  
  // Wellness
  wellness: {
    all: ['wellness'] as const,
    mood: () => ['wellness', 'mood'] as const,
    energy: () => ['wellness', 'energy'] as const,
    sleep: () => ['wellness', 'sleep'] as const,
  },
  
  // Onboarding
  onboarding: {
    all: ['onboarding'] as const,
    status: () => ['onboarding', 'status'] as const,
    progress: () => ['onboarding', 'progress'] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => ['notifications', 'list'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },
  
  // Sync
  sync: {
    all: ['sync'] as const,
    status: () => ['sync', 'status'] as const,
    queue: () => ['sync', 'queue'] as const,
  },
  
  // Settings
  settings: {
    all: ['settings'] as const,
    theme: () => ['settings', 'theme'] as const,
    preferences: () => ['settings', 'preferences'] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
