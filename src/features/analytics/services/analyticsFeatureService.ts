/**
 * Analytics Feature Service
 * 
 * Feature-specific analytics service.
 * Provides convenience methods for feature-level analytics.
 */

import { analyticsService } from '@/services/analytics';
import { isAnalyticsEnabled } from '../utils/analyticsHelpers';

/**
 * Feature analytics service
 */
class AnalyticsFeatureService {
  /**
   * Track feature-specific event
   */
  trackFeatureEvent(feature: string, action: string, properties?: Record<string, unknown>): void {
    if (!isAnalyticsEnabled()) {
      return;
    }

    analyticsService.track('TASK_CREATE' as any, {
      feature,
      action,
      ...properties,
    });
  }

  /**
   * Track feature view
   */
  trackFeatureView(feature: string): void {
    if (!isAnalyticsEnabled()) {
      return;
    }

    analyticsService.track('APP_OPEN' as any, {
      feature,
      action: 'view',
    });
  }

  /**
   * Track feature interaction
   */
  trackFeatureInteraction(feature: string, interaction: string, properties?: Record<string, unknown>): void {
    if (!isAnalyticsEnabled()) {
      return;
    }

    analyticsService.track('TASK_COMPLETE' as any, {
      feature,
      interaction,
      ...properties,
    });
  }
}

export const analyticsFeatureService = new AnalyticsFeatureService();
