/**
 * Account Migration Plan
 *
 * Utilities for planning and tracking guest → account migration.
 * This phase prepares the migration architecture only - no destructive
 * operations are performed.
 *
 * Migration flow:
 * 1. Create migration plan (identifies source, target, entities)
 * 2. Validate migration plan (checks for conflicts, data integrity)
 * 3. Mark migration started (sets startedAt timestamp)
 * 4. Execute migration (moves data from guest to authenticated partitions)
 * 5. Mark migration complete (sets completedAt timestamp)
 *
 * This file handles steps 1, 2, 3, and 5. Step 4 is deferred to a future phase.
 */

import type {
  LocalOwnerId,
  CloudOwnerId,
  AccountMigrationPlan,
  ConflictStrategy,
} from "../types/auth.types";

// ── Plan Creation ─────────────────────────────────────────────────────────────

/**
 * Create an account migration plan.
 *
 * @param sourceLocalOwnerId - The guest's local owner ID
 * @param targetCloudOwnerId - The authenticated user's cloud owner ID
 * @param conflictStrategy - Strategy for handling conflicts
 * @param entityNames - List of entity types to migrate (e.g., ["tasks", "habits"])
 */
export function createAccountMigrationPlan(
  sourceLocalOwnerId: LocalOwnerId,
  targetCloudOwnerId: CloudOwnerId,
  conflictStrategy: ConflictStrategy = "guest_wins",
  entityNames: string[] = ["tasks", "habits", "meals", "budget"],
): AccountMigrationPlan {
  const now = new Date().toISOString();

  // Generate affected storage partitions
  const affectedStoragePartitions = entityNames.map(
    (entity) => `guest:${sourceLocalOwnerId}:${entity}`,
  );

  // Generate affected sync queue partitions
  const affectedSyncQueuePartitions = [
    `guest:${sourceLocalOwnerId}:syncQueue`,
  ];

  return {
    sourceLocalOwnerId,
    targetCloudOwnerId,
    affectedStoragePartitions,
    affectedSyncQueuePartitions,
    entitiesToMigrate: entityNames,
    conflictStrategy,
    createdAt: now,
    startedAt: null,
    completedAt: null,
  };
}

// ── Plan Validation ───────────────────────────────────────────────────────────

/**
 * Validate an account migration plan.
 * Checks for:
 * - Valid source and target owner IDs
 * - Non-empty entity list
 * - Valid conflict strategy
 * - Plan not already started or completed
 *
 * Throws an error if validation fails.
 *
 * @param plan - The migration plan to validate
 */
export function validateAccountMigrationPlan(plan: AccountMigrationPlan): void {
  if (!plan.sourceLocalOwnerId) {
    throw new Error(
      "[validateAccountMigrationPlan] Missing sourceLocalOwnerId",
    );
  }

  if (!plan.targetCloudOwnerId) {
    throw new Error(
      "[validateAccountMigrationPlan] Missing targetCloudOwnerId",
    );
  }

  if (plan.sourceLocalOwnerId === plan.targetCloudOwnerId) {
    throw new Error(
      "[validateAccountMigrationPlan] Source and target owner IDs cannot be the same",
    );
  }

  if (!plan.entitiesToMigrate || plan.entitiesToMigrate.length === 0) {
    throw new Error(
      "[validateAccountMigrationPlan] At least one entity must be specified for migration",
    );
  }

  const validStrategies: ConflictStrategy[] = [
    "guest_wins",
    "cloud_wins",
    "merge",
    "manual",
  ];
  if (!validStrategies.includes(plan.conflictStrategy)) {
    throw new Error(
      `[validateAccountMigrationPlan] Invalid conflict strategy: ${plan.conflictStrategy}`,
    );
  }

  if (plan.startedAt !== null && plan.completedAt === null) {
    throw new Error(
      "[validateAccountMigrationPlan] Migration plan is already in progress (started but not completed)",
    );
  }

  if (plan.completedAt !== null) {
    throw new Error(
      "[validateAccountMigrationPlan] Migration plan has already been completed",
    );
  }
}

// ── Migration State Tracking ────────────────────────────────────────────────────

/**
 * Mark a migration plan as started.
 * Sets the startedAt timestamp to the current time.
 *
 * @param plan - The migration plan to mark as started
 * @returns A new plan instance with startedAt set
 */
export function markMigrationStarted(plan: AccountMigrationPlan): AccountMigrationPlan {
  if (plan.startedAt !== null) {
    throw new Error(
      "[markMigrationStarted] Migration plan is already started",
    );
  }

  return {
    ...plan,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Mark a migration plan as completed.
 * Sets the completedAt timestamp to the current time.
 *
 * @param plan - The migration plan to mark as completed
 * @returns A new plan instance with completedAt set
 */
export function markMigrationComplete(plan: AccountMigrationPlan): AccountMigrationPlan {
  if (plan.startedAt === null) {
    throw new Error(
      "[markMigrationComplete] Cannot complete migration that has not started",
    );
  }

  if (plan.completedAt !== null) {
    throw new Error(
      "[markMigrationComplete] Migration plan is already completed",
    );
  }

  return {
    ...plan,
    completedAt: new Date().toISOString(),
  };
}

// ── Migration Status Utilities ─────────────────────────────────────────────────

/**
 * Check if a migration plan is pending (not started).
 */
export function isMigrationPending(plan: AccountMigrationPlan): boolean {
  return plan.startedAt === null;
}

/**
 * Check if a migration plan is in progress (started but not completed).
 */
export function isMigrationInProgress(plan: AccountMigrationPlan): boolean {
  return plan.startedAt !== null && plan.completedAt === null;
}

/**
 * Check if a migration plan is completed.
 */
export function isMigrationCompleted(plan: AccountMigrationPlan): boolean {
  return plan.completedAt !== null;
}

/**
 * Get the duration of a migration in milliseconds.
 * Returns null if the migration has not completed.
 */
export function getMigrationDuration(plan: AccountMigrationPlan): number | null {
  if (!plan.startedAt || !plan.completedAt) {
    return null;
  }

  const started = new Date(plan.startedAt).getTime();
  const completed = new Date(plan.completedAt).getTime();
  return completed - started;
}

// ── Migration Description ───────────────────────────────────────────────────

/**
 * Get a human-readable description of a migration plan for debugging.
 */
export function describeMigrationPlan(plan: AccountMigrationPlan): string {
  const status = plan.completedAt !== null
    ? "completed"
    : plan.startedAt !== null
    ? "in progress"
    : "pending";

  const entities = plan.entitiesToMigrate.join(", ");
  const strategy = plan.conflictStrategy;

  return `Migration (${status}): ${plan.sourceLocalOwnerId.slice(0, 8)} → ${plan.targetCloudOwnerId.slice(0, 8)}, entities: [${entities}], strategy: ${strategy}`;
}
