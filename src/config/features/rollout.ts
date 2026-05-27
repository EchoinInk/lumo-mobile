/**
 * Feature Rollout Configuration
 *
 * Defines rollout strategies for features across environments and user segments.
 * Future: integrate with remote config for dynamic rollout control.
 *
 * Rollout Strategies:
 * - all: 100% of users
 * - percentage: X% of users (deterministic by user ID)
 * - dev: development environment only
 * - beta: beta testers only
 * - staged: staged rollout by cohort
 */

// ── Rollout Configuration ───────────────────────────────────────────────────────

/**
 * Rollout strategy types.
 */
export type RolloutStrategy = "all" | "percentage" | "dev" | "beta" | "staged";

/**
 * Rollout configuration for a feature.
 */
export interface RolloutConfig {
  /** Rollout strategy */
  strategy: RolloutStrategy;
  /** Percentage of users (for "percentage" strategy) */
  percentage?: number;
  /** Cohort IDs (for "staged" strategy) */
  cohorts?: string[];
  /** Minimum app version */
  minAppVersion?: string;
  /** Maximum app version (for phased rollouts) */
  maxAppVersion?: string;
  /** Platform filter (optional) */
  platform?: "ios" | "android" | "web" | "all";
}

/**
 * Rollout configuration map.
 */
export const rolloutConfig: Record<string, RolloutConfig> = {
  // Core Features - rolled out to all
  calmModeV2: {
    strategy: "all",
  },
  focusMode: {
    strategy: "all",
  },
  recurringTasksV2: {
    strategy: "all",
  },

  // Sync Recovery - staged rollout
  syncRecovery: {
    strategy: "percentage",
    percentage: 50,
  },

  // Experimental - dev only
  aiPlanningAssistant: {
    strategy: "dev",
  },
  smartScheduling: {
    strategy: "dev",
  },

  // Beta features
  taskDependencies: {
    strategy: "beta",
  },
};

// ── Rollout Utilities ───────────────────────────────────────────────────────────

/**
 * Get rollout configuration for a feature.
 *
 * @param featureKey - Feature key
 * @returns Rollout configuration or null
 */
export function getRolloutConfig(featureKey: string): RolloutConfig | null {
  return rolloutConfig[featureKey] || null;
}

/**
 * Check if a feature is rolled out to the current environment.
 *
 * @param featureKey - Feature key
 * @param userId - User ID (for percentage-based rollout)
 * @param environment - Current environment
 * @returns Whether the feature is rolled out
 */
export function isFeatureRolledOut(
  featureKey: string,
  userId?: string,
  environment: "dev" | "staging" | "production" = "production",
): boolean {
  const config = getRolloutConfig(featureKey);
  if (!config) {
    return false;
  }

  switch (config.strategy) {
    case "all":
      return true;

    case "dev":
      return environment === "dev";

    case "beta":
      // Future: check if user is in beta cohort
      return environment === "dev" || environment === "staging";

    case "percentage":
      if (!userId) {
        return false;
      }
      // Deterministic hash-based percentage check
      const hash = simpleHash(userId);
      const threshold = (config.percentage || 0) / 100;
      return (hash % 100) / 100 < threshold;

    case "staged":
      // Future: check if user is in specified cohort
      return false;

    default:
      return false;
  }
}

/**
 * Simple hash function for deterministic percentage-based rollout.
 *
 * @param str - String to hash
 * @returns Hash value
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
