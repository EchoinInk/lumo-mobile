/**
 * Focus Mode Constants
 * 
 * Constants for focus mode configurations and behaviors.
 */

export const FOCUS_MODE_CONSTANTS = {
  // Focus mode configurations
  SINGLE_TASK: {
    HIDE_ALL_OTHER_TASKS: true,
    SHOW_PROGRESS_ONLY: true,
    MINIMIZE_ACTIONS: true,
  } as const,

  DISTRACTION_FREE: {
    HIDE_SECONDARY_MODULES: true,
    MINIMIZE_VISUAL_NOISE: true,
    REDUCE_COLOR_INTENSITY: true,
    SUPPRESS_NOTIFICATIONS: true,
  } as const,

  TODAY_ONLY: {
    SHOW_TODAY_ONLY: true,
    HIDE_FUTURE_TASKS: true,
    HIDE_COMPLETED_TASKS: false,
    MINIMIZE_PLANNING_UI: true,
  } as const,

  CALM_MODE: {
    SOFTEN_VISUALS: true,
    REDUCE_MOTION: true,
    REDUCE_NOTIFICATIONS: true,
    LOWER_INTERACTION_DENSITY: true,
  } as const,

  // Dashboard density levels
  DASHBOARD_DENSITY: {
    MINIMAL: {
      MAX_CARDS: 2,
      MAX_ACTIONS_PER_CARD: 1,
    },
    NORMAL: {
      MAX_CARDS: 4,
      MAX_ACTIONS_PER_CARD: 2,
    },
    DENSE: {
      MAX_CARDS: 6,
      MAX_ACTIONS_PER_CARD: 3,
    },
  } as const,
} as const;
