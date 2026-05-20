/**
 * Empty State Constants
 * 
 * Calm, emotionally intelligent empty state messages.
 * Supportive tone without pressure or gamification.
 */

export interface EmptyStateConfig {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: string;
}

export const EMPTY_STATES: Record<string, EmptyStateConfig> = {
  tasks: {
    title: 'A gentle place to begin',
    description: 'Add your first task whenever you\'re ready',
    actionLabel: 'Add task',
  },
  habits: {
    title: 'Small steps build momentum',
    description: 'Create a habit to start tracking',
    actionLabel: 'Create habit',
  },
  meals: {
    title: 'Nourishment tracking',
    description: 'Log your first meal to get started',
    actionLabel: 'Log meal',
  },
  budget: {
    title: 'Financial awareness',
    description: 'Track your spending with calm clarity',
    actionLabel: 'Add transaction',
  },
  reminders: {
    title: 'No reminders yet',
    description: 'Set up gentle notifications for important moments',
    actionLabel: 'Add reminder',
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your search terms',
  },
  notifications: {
    title: 'All caught up',
    description: 'No new notifications at the moment',
  },
  offline: {
    title: 'Offline for now',
    description: 'Your progress is still safe here',
  },
  completed: {
    title: 'Nothing completed yet',
    description: 'Celebrate your first completion when you\'re ready',
  },
};

export const getEmptyState = (key: string): EmptyStateConfig => {
  return EMPTY_STATES[key] || EMPTY_STATES.search;
};
