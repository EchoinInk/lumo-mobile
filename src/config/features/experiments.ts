/**
 * Feature Experiments Configuration
 *
 * Defines A/B test experiments and experiment variants.
 * Future: integrate with remote config for dynamic experiment control.
 *
 * Philosophy:
 * - Experiments should be temporary
 * - All experiments should have clear success metrics
 * - Experiments should be opt-out capable
 * - Never ship permanent features as experiments
 */

// ── Experiment Types ───────────────────────────────────────────────────────────

/**
 * Experiment variant type.
 */
export type ExperimentVariant =
  | "control"
  | "variant_a"
  | "variant_b"
  | "variant_c";

/**
 * Experiment configuration.
 */
export interface ExperimentConfig {
  /** Experiment name */
  name: string;
  /** Whether the experiment is active */
  active: boolean;
  /** Variants available */
  variants: ExperimentVariant[];
  /** Default variant (fallback) */
  defaultVariant: ExperimentVariant;
  /** Percentage allocation per variant (partial record allowed) */
  allocation: Partial<Record<ExperimentVariant, number>>;
  /** Start date (ISO string) */
  startDate?: string;
  /** End date (ISO string) */
  endDate?: string;
  /** Success metrics to track */
  metrics: string[];
}

// ── Experiment Configuration ───────────────────────────────────────────────────

/**
 * Active experiments configuration.
 */
export const experiments: Record<string, ExperimentConfig> = {
  // Example: Onboarding flow experiment
  onboardingFlowV2: {
    name: "Onboarding Flow V2",
    active: false,
    variants: ["control", "variant_a"],
    defaultVariant: "control",
    allocation: {
      control: 50,
      variant_a: 50,
    },
    metrics: ["onboarding_completion_rate", "time_to_first_task"],
  },

  // Example: Task creation UX experiment
  taskCreationUX: {
    name: "Task Creation UX",
    active: false,
    variants: ["control", "variant_a", "variant_b"],
    defaultVariant: "control",
    allocation: {
      control: 60,
      variant_a: 20,
      variant_b: 20,
    },
    metrics: ["task_creation_rate", "task_completion_rate"],
  },

  // Example: Calm mode visual density experiment
  calmModeDensity: {
    name: "Calm Mode Visual Density",
    active: false,
    variants: ["control", "variant_a"],
    defaultVariant: "control",
    allocation: {
      control: 50,
      variant_a: 50,
    },
    metrics: ["session_duration", "task_focus_time"],
  },
};

// ── Experiment Utilities ───────────────────────────────────────────────────────

/**
 * Get experiment configuration.
 *
 * @param experimentKey - Experiment key
 * @returns Experiment configuration or null
 */
export function getExperimentConfig(
  experimentKey: string,
): ExperimentConfig | null {
  return experiments[experimentKey] || null;
}

/**
 * Check if an experiment is active.
 *
 * @param experimentKey - Experiment key
 * @returns Whether the experiment is active
 */
export function isExperimentActive(experimentKey: string): boolean {
  const config = getExperimentConfig(experimentKey);
  if (!config) {
    return false;
  }

  // Check if experiment is within date range
  if (config.startDate && new Date(config.startDate) > new Date()) {
    return false;
  }

  if (config.endDate && new Date(config.endDate) < new Date()) {
    return false;
  }

  return config.active;
}

/**
 * Get the variant for a user in an experiment.
 *
 * @param experimentKey - Experiment key
 * @param userId - User ID
 * @returns Variant for the user
 */
export function getExperimentVariant(
  experimentKey: string,
  userId: string,
): ExperimentVariant {
  const config = getExperimentConfig(experimentKey);
  if (!config || !isExperimentActive(experimentKey)) {
    return "control";
  }

  // Deterministic variant assignment based on user ID
  const hash = simpleHash(userId);
  const totalAllocation = Object.values(config.allocation).reduce(
    (sum, val) => sum + val,
    0,
  );
  const normalizedHash = (hash % totalAllocation) / totalAllocation;

  let cumulative = 0;
  for (const [variant, allocation] of Object.entries(config.allocation)) {
    cumulative += allocation;
    if (normalizedHash < cumulative / totalAllocation) {
      return variant as ExperimentVariant;
    }
  }

  return config.defaultVariant;
}

/**
 * Check if a user is in a specific variant.
 *
 * @param experimentKey - Experiment key
 * @param userId - User ID
 * @param variant - Variant to check
 * @returns Whether the user is in the variant
 */
export function isUserInVariant(
  experimentKey: string,
  userId: string,
  variant: ExperimentVariant,
): boolean {
  return getExperimentVariant(experimentKey, userId) === variant;
}

/**
 * Simple hash function for deterministic variant assignment.
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

/**
 * Get all active experiments.
 *
 * @returns Array of active experiment keys
 */
export function getActiveExperiments(): string[] {
  return Object.keys(experiments).filter(isExperimentActive);
}
