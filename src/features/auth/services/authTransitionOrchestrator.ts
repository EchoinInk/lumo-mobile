/**
 * Auth Transition Orchestrator
 *
 * Coordinates guest → authenticated and authenticated → signed-out transitions.
 * Ensures ownership safety, sync isolation, and local-first behavior during transitions.
 *
 * Responsibilities:
 * - Coordinate guest → account migration
 * - Coordinate authenticated → signed-out transition
 * - Pause sync during transitions
 * - Prevent ownership corruption
 * - Preserve local-first behavior
 * - Mark migration state safely
 *
 * NOT responsible for:
 * - Destructive migration (Phase 13.4)
 * - Guest data deletion (Phase 13.4)
 * - Automatic sync replay (Phase 13.4)
 * - UI logic (handled by screens/hooks)
 */

import type {
    CloudOwnerId,
    LocalOwnerId
} from "../types/auth.types";

// ── Transition State ─────────────────────────────────────────────────────────────

export type TransitionType = "guest_upgrade" | "authenticated_logout";

export interface TransitionState {
  type: TransitionType;
  localOwnerId: LocalOwnerId;
  cloudOwnerId?: CloudOwnerId;
  status: "pending" | "in_progress" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  error?: string;
}

let currentTransition: TransitionState | null = null;

// ── Guest Upgrade ───────────────────────────────────────────────────────────────

/**
 * Begin guest → account upgrade transition.
 * Marks transition as in progress and pauses sync.
 *
 * @param localOwnerId - Current local owner ID
 * @param cloudOwnerId - Target cloud owner ID from Supabase
 * @returns Transition state
 */
export function beginGuestUpgrade(
  localOwnerId: LocalOwnerId,
  cloudOwnerId: CloudOwnerId,
): TransitionState {
  if (currentTransition && currentTransition.status === "in_progress") {
    throw new Error(
      "[AuthTransitionOrchestrator] Cannot begin upgrade: transition already in progress",
    );
  }

  currentTransition = {
    type: "guest_upgrade",
    localOwnerId,
    cloudOwnerId,
    status: "in_progress",
    startedAt: new Date().toISOString(),
  };

  console.log(
    `[AuthTransitionOrchestrator] Beginning guest upgrade: ${localOwnerId} → ${cloudOwnerId}`,
  );

  // TODO: Pause sync queue processing
  // TODO: Mark sync queue as in migration state

  return currentTransition;
}

/**
 * Finalize guest → account upgrade transition.
 * Marks transition as completed and resumes sync.
 *
 * @returns Transition state
 */
export function finalizeGuestUpgrade(): TransitionState {
  if (!currentTransition || currentTransition.type !== "guest_upgrade") {
    throw new Error(
      "[AuthTransitionOrchestrator] Cannot finalize upgrade: no active guest upgrade transition",
    );
  }

  if (currentTransition.status !== "in_progress") {
    throw new Error(
      "[AuthTransitionOrchestrator] Cannot finalize upgrade: transition not in progress",
    );
  }

  currentTransition = {
    ...currentTransition,
    status: "completed",
    completedAt: new Date().toISOString(),
  };

  console.log(
    `[AuthTransitionOrchestrator] Guest upgrade completed: ${currentTransition.localOwnerId} → ${currentTransition.cloudOwnerId}`,
  );

  // TODO: Resume sync queue processing
  // TODO: Clear migration state from sync queue

  return currentTransition;
}

// ── Authenticated Logout ───────────────────────────────────────────────────────

/**
 * Begin authenticated → signed-out transition.
 * Marks transition as in progress and pauses sync.
 *
 * @param localOwnerId - Current local owner ID
 * @param cloudOwnerId - Current cloud owner ID
 * @returns Transition state
 */
export function beginLogoutTransition(
  localOwnerId: LocalOwnerId,
  cloudOwnerId: CloudOwnerId,
): TransitionState {
  if (currentTransition && currentTransition.status === "in_progress") {
    throw new Error(
      "[AuthTransitionOrchestrator] Cannot begin logout: transition already in progress",
    );
  }

  currentTransition = {
    type: "authenticated_logout",
    localOwnerId,
    cloudOwnerId,
    status: "in_progress",
    startedAt: new Date().toISOString(),
  };

  console.log(
    `[AuthTransitionOrchestrator] Beginning logout: ${cloudOwnerId} → guest`,
  );

  // TODO: Pause sync queue processing
  // TODO: Mark sync queue as in transition state

  return currentTransition;
}

/**
 * Finalize authenticated → signed-out transition.
 * Marks transition as completed and resets to guest mode.
 *
 * @returns Transition state
 */
export function finalizeLogoutTransition(): TransitionState {
  if (!currentTransition || currentTransition.type !== "authenticated_logout") {
    throw new Error(
      "[AuthTransitionOrchestrator] Cannot finalize logout: no active logout transition",
    );
  }

  if (currentTransition.status !== "in_progress") {
    throw new Error(
      "[AuthTransitionOrchestrator] Cannot finalize logout: transition not in progress",
    );
  }

  currentTransition = {
    ...currentTransition,
    status: "completed",
    completedAt: new Date().toISOString(),
  };

  console.log(
    `[AuthTransitionOrchestrator] Logout completed: ${currentTransition.cloudOwnerId} → guest`,
  );

  // TODO: Resume sync queue processing
  // TODO: Clear transition state from sync queue

  return currentTransition;
}

// ── Transition Queries ───────────────────────────────────────────────────────────

/**
 * Get the current transition state.
 */
export function getCurrentTransition(): TransitionState | null {
  return currentTransition;
}

/**
 * Check if a transition is currently in progress.
 */
export function isTransitionInProgress(): boolean {
  return currentTransition?.status === "in_progress" || false;
}

/**
 * Check if a guest upgrade is in progress.
 */
export function isGuestUpgradeInProgress(): boolean {
  return (
    currentTransition?.type === "guest_upgrade" &&
    currentTransition.status === "in_progress"
  );
}

/**
 * Check if a logout is in progress.
 */
export function isLogoutInProgress(): boolean {
  return (
    currentTransition?.type === "authenticated_logout" &&
    currentTransition.status === "in_progress"
  );
}

/**
 * Reset the current transition (useful for testing or error recovery).
 */
export function resetTransition(): void {
  currentTransition = null;
  console.log("[AuthTransitionOrchestrator] Transition reset");
}

/**
 * Mark the current transition as failed.
 *
 * @param error - Error message
 */
export function markTransitionFailed(error: string): TransitionState {
  if (!currentTransition) {
    throw new Error(
      "[AuthTransitionOrchestrator] Cannot mark failed: no active transition",
    );
  }

  currentTransition = {
    ...currentTransition,
    status: "failed",
    error,
  };

  console.error(
    `[AuthTransitionOrchestrator] Transition failed: ${currentTransition.type} - ${error}`,
  );

  // TODO: Resume sync queue processing
  // TODO: Clear transition state from sync queue

  return currentTransition;
}
