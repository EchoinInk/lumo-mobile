/**
 * Analytics Helpers
 * 
 * Utility functions for analytics.
 */

import { useAnalyticsStore } from '../store/useAnalyticsStore';

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  const { enabled, hasOptedOut } = useAnalyticsStore.getState();
  return enabled && !hasOptedOut;
};

/**
 * Check if user has opted out
 */
export const hasUserOptedOut = (): boolean => {
  const { hasOptedOut } = useAnalyticsStore.getState();
  return hasOptedOut;
};

/**
 * Get opt-out timestamp
 */
export const getOptOutTimestamp = (): number | null => {
  const { optOutTimestamp } = useAnalyticsStore.getState();
  return optOutTimestamp;
};

/**
 * Format event properties for analytics
 */
export const formatEventProperties = (properties: Record<string, unknown>): Record<string, string | number | boolean> => {
  const formatted: Record<string, string | number | boolean> = {};
  
  Object.entries(properties).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      formatted[key] = value;
    }
  });
  
  return formatted;
};
