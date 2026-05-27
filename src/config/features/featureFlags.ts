/**
 * Feature Flags
 *
 * Centralized feature flag configuration for Lumo.
 * All feature toggles should be defined here to avoid scattered magic booleans.
 *
 * Philosophy:
 * - Default to false for experimental features
 * - Default to true for stable core features
 * - Use typed flags for type safety
 * - Future: integrate with remote config for dynamic rollout
 *
 * Usage:
 * ```ts
 * import { isFeatureEnabled, requireFeature } from '@/config/features/featureFlags';
 *
 * if (isFeatureEnabled('calmModeV2')) {
 *   // render calm mode UI
 * }
 *
 * const aiEnabled = requireFeature('aiPlanningAssistant');
 * ```
 */

// ── Feature Flag Definition ───────────────────────────────────────────────────────

/**
 * Feature flag configuration.
 * All flags are typed and readonly to prevent accidental modification.
 */
export const featureFlags = {
  // Core Features
  calmModeV2: true,
  focusMode: true,
  recoveryMode: false,

  // AI / Smart Features
  aiPlanningAssistant: false,
  smartScheduling: false,
  aiTaskSuggestions: false,

  // Task Management
  recurringTasksV2: true,
  taskDependencies: false,
  taskTemplates: false,
  bulkTaskActions: false,

  // Sync & Offline
  offlineQueueV2: true,
  syncRecovery: true,
  conflictResolutionV2: true,

  // Onboarding
  onboardingV2: true,
  guidedSetup: true,

  // Analytics & Observability
  performanceMetrics: true,
  syncMetrics: true,
  crashReporting: false,

  // UI / UX
  reducedMotionSupport: true,
  highContrastMode: false,
  largeTextSupport: true,

  // Experimental
  experimentalFeatureX: false,
  experimentalFeatureY: false,
} as const;

// ── Feature Flag Types ───────────────────────────────────────────────────────────

/**
 * Union type of all feature flag keys.
 */
export type FeatureFlagKey = keyof typeof featureFlags;

/**
 * Type guard for feature flag keys.
 */
export function isFeatureFlagKey(key: string): key is FeatureFlagKey {
  return key in featureFlags;
}

// ── Feature Flag Utilities ───────────────────────────────────────────────────────

/**
 * Check if a feature is enabled.
 *
 * @param key - Feature flag key
 * @returns Whether the feature is enabled
 *
 * @example
 * ```ts
 * if (isFeatureEnabled('calmModeV2')) {
 *   return <CalmModeUI />;
 * }
 * ```
 */
export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  return featureFlags[key] === true;
}

/**
 * Require a feature to be enabled.
 * Throws an error if the feature is disabled.
 *
 * @param key - Feature flag key
 * @returns Whether the feature is enabled
 * @throws Error if feature is disabled
 *
 * @example
 * ```ts
 * const aiEnabled = requireFeature('aiPlanningAssistant');
 * // Throws if aiPlanningAssistant is false
 * ```
 */
export function requireFeature(key: FeatureFlagKey): boolean {
  if (!isFeatureEnabled(key)) {
    throw new Error(`Feature "${key}" is required but disabled`);
  }
  return true;
}

/**
 * Get all enabled features.
 *
 * @returns Array of enabled feature keys
 */
export function getEnabledFeatures(): FeatureFlagKey[] {
  return (Object.keys(featureFlags) as FeatureFlagKey[]).filter(isFeatureEnabled);
}

/**
 * Get all disabled features.
 *
 * @returns Array of disabled feature keys
 */
export function getDisabledFeatures(): FeatureFlagKey[] {
  return (Object.keys(featureFlags) as FeatureFlagKey[]).filter(
    (key) => !isFeatureEnabled(key),
  );
}

/**
 * Check if any of the given features are enabled.
 *
 * @param keys - Array of feature flag keys
 * @returns Whether any of the features are enabled
 */
export function isAnyFeatureEnabled(keys: FeatureFlagKey[]): boolean {
  return keys.some(isFeatureEnabled);
}

/**
 * Check if all of the given features are enabled.
 *
 * @param keys - Array of feature flag keys
 * @returns Whether all of the features are enabled
 */
export function areAllFeaturesEnabled(keys: FeatureFlagKey[]): boolean {
  return keys.every(isFeatureEnabled);
}
