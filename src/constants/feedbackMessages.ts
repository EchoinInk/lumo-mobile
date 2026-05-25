/**
 * Feedback Message Constants
 *
 * Calm, emotionally safe feedback messages.
 * No alarming language, no technical jargon.
 */

export interface FeedbackMessage {
  title: string;
  description: string;
  actionLabel?: string;
}

export const ERROR_MESSAGES: Record<string, FeedbackMessage> = {
  network: {
    title: "Connection issue",
    description: "Something didn't load properly. Let's try again.",
    actionLabel: "Retry",
  },
  offline: {
    title: "Offline for now",
    description: "Changes will sync when you're back online.",
  },
  storage: {
    title: "Storage issue",
    description:
      "Something went wrong saving your data. It's safe to try again.",
    actionLabel: "Retry",
  },
  auth: {
    title: "Authentication issue",
    description: "Please sign in again to continue.",
    actionLabel: "Sign in",
  },
  validation: {
    title: "Please check your input",
    description: "Something needs adjustment before we can proceed.",
  },
  sync: {
    title: "Sync paused",
    description: "Your changes are saved locally. We'll sync when possible.",
  },
  unknown: {
    title: "Something didn't work",
    description: "Let's try that again together.",
    actionLabel: "Retry",
  },
};

export const SUCCESS_MESSAGES: Record<string, FeedbackMessage> = {
  taskCreated: {
    title: "Task added",
    description: "Your task is ready when you are.",
  },
  taskCompleted: {
    title: "Task complete",
    description: "Well done — that's one step forward.",
  },
  habitCreated: {
    title: "Habit created",
    description: "Small steps build lasting change.",
  },
  habitCompleted: {
    title: "Hit your habit",
    description: "Consistency is progress.",
  },
  mealLogged: {
    title: "Meal logged",
    description: "Nourishment tracked with care.",
  },
  syncComplete: {
    title: "Synced successfully",
    description: "Everything is up to date.",
  },
  offlineSync: {
    title: "Changes saved",
    description: "Your progress is safe offline.",
  },
};

export const LOADING_MESSAGES: Record<string, string> = {
  default: "Loading...",
  tasks: "Loading tasks",
  habits: "Loading habits",
  meals: "Loading meals",
  budget: "Loading budget",
  sync: "Syncing...",
  saving: "Saving...",
};

export const RETRY_MESSAGES: Record<string, FeedbackMessage> = {
  network: {
    title: "Let's try again",
    description: "Connection should be stable now.",
    actionLabel: "Retry",
  },
  timeout: {
    title: "Taking a moment",
    description: "This is taking longer than expected.",
    actionLabel: "Retry",
  },
  general: {
    title: "Let's try that again",
    description: "We'll get there together.",
    actionLabel: "Retry",
  },
};

export const OFFLINE_MESSAGES: Record<string, FeedbackMessage> = {
  default: {
    title: "Offline for now",
    description: "Your progress is still safe here.",
  },
  syncPending: {
    title: "Offline — changes saved",
    description: "We'll sync when you're back online.",
  },
  featureUnavailable: {
    title: "Feature unavailable offline",
    description: "This needs an internet connection.",
  },
};

export const EMPTY_MESSAGES: Record<string, FeedbackMessage> = {
  default: {
    title: "Nothing here right now",
    description: "This space is calm and waiting.",
  },
  tasks: {
    title: "No tasks yet",
    description: "When you're ready, add one small thing.",
  },
  habits: {
    title: "No habits yet",
    description: "Small steps build lasting change.",
  },
  meals: {
    title: "No meals logged",
    description: "Your nourishment journey starts when you're ready.",
  },
  budget: {
    title: "No budget items",
    description: "Financial clarity begins with a single entry.",
  },
  dashboard: {
    title: "Nothing urgent here",
    description: "You can add what feels right when you're ready.",
  },
};

export const getErrorMessage = (key: string): FeedbackMessage => {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.unknown;
};

export const getSuccessMessage = (key: string): FeedbackMessage => {
  return SUCCESS_MESSAGES[key] || SUCCESS_MESSAGES.taskCreated;
};

export const getLoadingMessage = (key: string): string => {
  return LOADING_MESSAGES[key] || LOADING_MESSAGES.default;
};

export const getRetryMessage = (key: string): FeedbackMessage => {
  return RETRY_MESSAGES[key] || RETRY_MESSAGES.general;
};

export const getOfflineMessage = (key: string): FeedbackMessage => {
  return OFFLINE_MESSAGES[key] || OFFLINE_MESSAGES.default;
};
