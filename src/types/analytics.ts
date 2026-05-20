/**
 * Analytics Type Definitions
 * 
 * Lightweight, privacy-focused analytics.
 * No surveillance, no tracking, no personal data collection.
 */

/**
 * Event names for analytics
 */
export enum AnalyticsEvent {
  // App lifecycle
  APP_OPEN = 'app_open',
  APP_CLOSE = 'app_close',
  APP_FOREGROUND = 'app_foreground',
  APP_BACKGROUND = 'app_background',

  // Onboarding
  ONBOARDING_START = 'onboarding_start',
  ONBOARDING_STEP_COMPLETE = 'onboarding_step_complete',
  ONBOARDING_COMPLETE = 'onboarding_complete',

  // Feature usage
  TASK_CREATE = 'task_create',
  TASK_COMPLETE = 'task_complete',
  TASK_DELETE = 'task_delete',
  HABIT_CREATE = 'habit_create',
  HABIT_COMPLETE = 'habit_complete',
  MEAL_LOG = 'meal_log',
  BUDGET_TRANSACTION = 'budget_transaction',

  // Errors
  ERROR_OCCURRED = 'error_occurred',

  // Sync
  SYNC_START = 'sync_start',
  SYNC_COMPLETE = 'sync_complete',
  SYNC_FAILED = 'sync_failed',

  // Settings
  THEME_CHANGE = 'theme_change',
  ACCESSIBILITY_CHANGE = 'accessibility_change',
}

/**
 * Event properties
 */
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Analytics event payload
 */
export interface AnalyticsEventPayload {
  eventName: AnalyticsEvent;
  properties?: AnalyticsEventProperties;
  timestamp: number;
}

/**
 * Analytics queue entry
 */
export interface AnalyticsQueueEntry {
  id: string;
  event: AnalyticsEventPayload;
  timestamp: number;
  retryCount: number;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
  maxQueueSize: number;
}

/**
 * Analytics session info
 */
export interface AnalyticsSession {
  sessionId: string;
  startTime: number;
  events: AnalyticsEventPayload[];
}
