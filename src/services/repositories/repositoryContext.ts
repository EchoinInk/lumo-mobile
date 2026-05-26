/**
 * Repository Context
 *
 * Provides ownership context to repositories for identity-safe data operations.
 * Repositories must never infer ownership from global state - they must receive
 * ownership through RepositoryContext.
 *
 * This ensures:
 * - Data isolation between guest and authenticated users
 * - Safe guest → account migration
 * - Clear ownership audit trail
 * - Storage partitioning by owner
 *
 * Usage:
 *   const context = getRepositoryContext();
 *   const tasks = await taskRepository.getAll(context);
 *
 * During migration:
 *   const context = createAuthenticatedRepositoryContext(localOwnerId, cloudOwnerId, true);
 *   // isMigrating = true allows repositories to handle migration-specific logic
 */

import type {
  AccountMode,
  LocalOwnerId,
  CloudOwnerId,
  RepositoryContext,
} from "@/features/auth/types/auth.types";

// ── Context Creation ───────────────────────────────────────────────────────────

/**
 * Create a repository context for guest mode.
 * Uses localOwnerId for storage partitioning.
 */
export function createGuestRepositoryContext(
  localOwnerId: LocalOwnerId,
): RepositoryContext {
  const storagePartitionKey = `guest:${localOwnerId}`;
  const syncPartitionKey = `guest:${localOwnerId}:syncQueue`;

  return {
    accountMode: "guest",
    localOwnerId,
    cloudOwnerId: undefined,
    storagePartitionKey,
    syncPartitionKey,
    isMigrating: false,
  };
}

/**
 * Create a repository context for authenticated mode.
 * Uses cloudOwnerId for storage partitioning.
 */
export function createAuthenticatedRepositoryContext(
  localOwnerId: LocalOwnerId,
  cloudOwnerId: CloudOwnerId,
  isMigrating: boolean = false,
): RepositoryContext {
  const storagePartitionKey = `user:${cloudOwnerId}`;
  const syncPartitionKey = `user:${cloudOwnerId}:syncQueue`;

  return {
    accountMode: "authenticated",
    localOwnerId,
    cloudOwnerId,
    storagePartitionKey,
    syncPartitionKey,
    isMigrating,
  };
}

// ── Context Retrieval ─────────────────────────────────────────────────────────

/**
 * Get the current repository context from the auth session store.
 * This is the canonical way to obtain context for repository operations.
 *
 * Throws an error if the session is not yet hydrated or if ownership is missing.
 */
export function getRepositoryContext(): RepositoryContext {
  // Import here to avoid circular dependency
  const { useAuthSessionStore } = require("@/features/auth/store/useAuthSessionStore");
  const state = useAuthSessionStore.getState();

  if (!state.hasHydrated) {
    throw new Error(
      "[getRepositoryContext] Cannot get context before session hydration",
    );
  }

  if (!state.localOwnerId) {
    throw new Error(
      "[getRepositoryContext] Missing localOwnerId - session not initialized",
    );
  }

  if (state.accountMode === "authenticated" && !state.cloudOwnerId) {
    throw new Error(
      "[getRepositoryContext] Missing cloudOwnerId in authenticated mode",
    );
  }

  if (state.accountMode === "guest") {
    return createGuestRepositoryContext(state.localOwnerId);
  }

  return createAuthenticatedRepositoryContext(
    state.localOwnerId,
    state.cloudOwnerId!,
    state.transitionStatus !== "idle" && state.transitionStatus !== "completed",
  );
}

// ── Context Assertion ─────────────────────────────────────────────────────────

/**
 * Assert that a repository context is valid.
 * Throws an error if the context is malformed.
 *
 * Use this in repository constructors or methods to ensure
 * ownership boundaries are respected.
 */
export function assertRepositoryContext(
  context: RepositoryContext | null | undefined,
): asserts context is RepositoryContext {
  if (!context) {
    throw new Error(
      "[assertRepositoryContext] Repository context is required but was null/undefined",
    );
  }

  if (!context.localOwnerId) {
    throw new Error(
      "[assertRepositoryContext] Repository context missing localOwnerId",
    );
  }

  if (context.accountMode === "authenticated" && !context.cloudOwnerId) {
    throw new Error(
      "[assertRepositoryContext] Repository context missing cloudOwnerId in authenticated mode",
    );
  }

  if (!context.storagePartitionKey) {
    throw new Error(
      "[assertRepositoryContext] Repository context missing storagePartitionKey",
    );
  }

  if (!context.syncPartitionKey) {
    throw new Error(
      "[assertRepositoryContext] Repository context missing syncPartitionKey",
    );
  }
}

// ── Context Utilities ─────────────────────────────────────────────────────────

/**
 * Check if a context is in guest mode.
 */
export function isGuestContext(context: RepositoryContext): boolean {
  return context.accountMode === "guest";
}

/**
 * Check if a context is in authenticated mode.
 */
export function isAuthenticatedContext(context: RepositoryContext): boolean {
  return context.accountMode === "authenticated";
}

/**
 * Check if a context is currently migrating.
 */
export function isMigratingContext(context: RepositoryContext): boolean {
  return context.isMigrating;
}

/**
 * Get a human-readable description of the context for debugging.
 */
export function describeContext(context: RepositoryContext): string {
  const mode = context.accountMode;
  const owner = context.accountMode === "guest"
    ? `local:${context.localOwnerId.slice(0, 8)}`
    : `cloud:${context.cloudOwnerId?.slice(0, 8)}`;
  const migration = context.isMigrating ? " (migrating)" : "";
  return `${mode} mode, owner ${owner}${migration}`;
}
