/**
 * Analytics Events
 * 
 * Lightweight event definitions for analytics.
 * No surveillance, no personal data collection.
 */

import { AnalyticsEvent, AnalyticsEventPayload } from '@/types/analytics';

/**
 * Track app open
 */
export const trackAppOpen = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.APP_OPEN,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track app close
 */
export const trackAppClose = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.APP_CLOSE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track onboarding start
 */
export const trackOnboardingStart = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.ONBOARDING_START,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track onboarding step complete
 */
export const trackOnboardingStepComplete = (step: number, properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.ONBOARDING_STEP_COMPLETE,
    properties: {
      step,
      ...properties,
    },
    timestamp: Date.now(),
  };
};

/**
 * Track onboarding complete
 */
export const trackOnboardingComplete = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.ONBOARDING_COMPLETE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track task creation
 */
export const trackTaskCreate = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.TASK_CREATE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track task completion
 */
export const trackTaskComplete = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.TASK_COMPLETE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track task deletion
 */
export const trackTaskDelete = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.TASK_DELETE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track habit creation
 */
export const trackHabitCreate = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.HABIT_CREATE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track habit completion
 */
export const trackHabitComplete = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.HABIT_COMPLETE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track meal logging
 */
export const trackMealLog = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.MEAL_LOG,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track budget transaction
 */
export const trackBudgetTransaction = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.BUDGET_TRANSACTION,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track error occurrence
 */
export const trackError = (errorType: string, properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.ERROR_OCCURRED,
    properties: {
      errorType,
      ...properties,
    },
    timestamp: Date.now(),
  };
};

/**
 * Track sync start
 */
export const trackSyncStart = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.SYNC_START,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track sync complete
 */
export const trackSyncComplete = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.SYNC_COMPLETE,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track sync failure
 */
export const trackSyncFailed = (properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.SYNC_FAILED,
    properties,
    timestamp: Date.now(),
  };
};

/**
 * Track theme change
 */
export const trackThemeChange = (theme: string, properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.THEME_CHANGE,
    properties: {
      theme,
      ...properties,
    },
    timestamp: Date.now(),
  };
};

/**
 * Track accessibility change
 */
export const trackAccessibilityChange = (setting: string, properties?: AnalyticsEventPayload['properties']): AnalyticsEventPayload => {
  return {
    eventName: AnalyticsEvent.ACCESSIBILITY_CHANGE,
    properties: {
      setting,
      ...properties,
    },
    timestamp: Date.now(),
  };
};
