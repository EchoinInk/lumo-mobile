/**
 * Analytics Service
 * 
 * Lightweight analytics service with provider abstraction.
 * No surveillance, no personal data collection.
 */

import { AnalyticsEvent, AnalyticsEventPayload } from '@/types/analytics';
import * as analyticsEvents from './analyticsEvents';
import { analyticsQueue } from './analyticsQueue';

/**
 * Analytics service class
 */
class AnalyticsService {
  private initialized = false;

  /**
   * Initialize analytics service
   */
  initialize(config?: { enabled?: boolean }): void {
    if (this.initialized) {
      return;
    }

    analyticsQueue.initialize({
      enabled: config?.enabled ?? true,
      batchSize: 10,
      flushInterval: 30000,
      maxQueueSize: 100,
    });

    this.initialized = true;

    // Track app open
    this.trackAppOpen();
  }

  /**
   * Track an event
   */
  track(eventName: AnalyticsEvent, properties?: AnalyticsEventPayload['properties']): void {
    if (!this.initialized) {
      return;
    }

    const event: AnalyticsEventPayload = {
      eventName,
      properties,
      timestamp: Date.now(),
    };

    analyticsQueue.add(event);
  }

  /**
   * Track app open
   */
  trackAppOpen(): void {
    const event = analyticsEvents.trackAppOpen();
    analyticsQueue.add(event);
  }

  /**
   * Track app close
   */
  trackAppClose(): void {
    const event = analyticsEvents.trackAppClose();
    analyticsQueue.add(event);
  }

  /**
   * Track onboarding start
   */
  trackOnboardingStart(): void {
    const event = analyticsEvents.trackOnboardingStart();
    analyticsQueue.add(event);
  }

  /**
   * Track onboarding step complete
   */
  trackOnboardingStepComplete(step: number): void {
    const event = analyticsEvents.trackOnboardingStepComplete(step);
    analyticsQueue.add(event);
  }

  /**
   * Track onboarding complete
   */
  trackOnboardingComplete(): void {
    const event = analyticsEvents.trackOnboardingComplete();
    analyticsQueue.add(event);
  }

  /**
   * Track task creation
   */
  trackTaskCreate(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackTaskCreate(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track task completion
   */
  trackTaskComplete(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackTaskComplete(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track task deletion
   */
  trackTaskDelete(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackTaskDelete(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track habit creation
   */
  trackHabitCreate(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackHabitCreate(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track habit completion
   */
  trackHabitComplete(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackHabitComplete(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track meal logging
   */
  trackMealLog(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackMealLog(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track budget transaction
   */
  trackBudgetTransaction(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackBudgetTransaction(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track error occurrence
   */
  trackError(errorType: string, properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackError(errorType, properties);
    analyticsQueue.add(event);
  }

  /**
   * Track sync start
   */
  trackSyncStart(): void {
    const event = analyticsEvents.trackSyncStart();
    analyticsQueue.add(event);
  }

  /**
   * Track sync complete
   */
  trackSyncComplete(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackSyncComplete(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track sync failure
   */
  trackSyncFailed(properties?: AnalyticsEventPayload['properties']): void {
    const event = analyticsEvents.trackSyncFailed(properties);
    analyticsQueue.add(event);
  }

  /**
   * Track theme change
   */
  trackThemeChange(theme: string): void {
    const event = analyticsEvents.trackThemeChange(theme);
    analyticsQueue.add(event);
  }

  /**
   * Track accessibility change
   */
  trackAccessibilityChange(setting: string): void {
    const event = analyticsEvents.trackAccessibilityChange(setting);
    analyticsQueue.add(event);
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    await analyticsQueue.flush();
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    analyticsQueue.setEnabled(enabled);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return analyticsQueue.size();
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
