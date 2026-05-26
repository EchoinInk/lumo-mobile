/**
 * Auth Readiness Types
 *
 * Canonical identity-safe types for guest and authenticated user ownership.
 * These types prepare Lumo for Supabase Auth integration without requiring
 * immediate backend connection.
 *
 * Core principles:
 * - Guest users have stable localOwnerId
 * - Authenticated users have cloudOwnerId
 * - Repositories receive ownership via RepositoryContext, never global state
 * - Storage is partitioned by owner to prevent data leakage
 *
 * This file is separate from existing auth types to avoid breaking changes.
 * Existing auth.ts will eventually migrate to these types when Supabase is wired.
 */

// ── Account Mode ─────────────────────────────────────────────────────────────

/**
 * The current account mode of the application.
 * - guest: User is using the app without an account (local-first mode)
 * - authenticated: User has signed in with an account (cloud-backed mode)
 */
export type AccountMode = "guest" | "authenticated";

// ── User Identity ─────────────────────────────────────────────────────────────

/**
 * Stable identifier for a guest user's local data.
 * Generated once on first app launch and persists across sessions.
 * Used to partition local storage for guest mode.
 */
export type LocalOwnerId = string;

/**
 * Cloud identifier for an authenticated user.
 * Provided by Supabase Auth when user signs in.
 * Used to partition storage and sync queue for authenticated mode.
 */
export type CloudOwnerId = string;

/**
 * Unified user identity that can represent either guest or authenticated state.
 */
export interface UserIdentity {
  /** Current account mode */
  accountMode: AccountMode;
  /** Stable local owner ID (always present) */
  localOwnerId: LocalOwnerId;
  /** Cloud owner ID (present only when authenticated) */
  cloudOwnerId?: CloudOwnerId;
}

// ── User Types ───────────────────────────────────────────────────────────────

/**
 * Guest user representation.
 * Has no cloud identity, only local ownership.
 */
export interface GuestUser {
  type: "guest";
  localOwnerId: LocalOwnerId;
}

/**
 * Authenticated user representation.
 * Has both local and cloud identity.
 */
export interface AuthUser {
  type: "authenticated";
  localOwnerId: LocalOwnerId;
  cloudOwnerId: CloudOwnerId;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

/**
 * Union type for all user states.
 */
export type AnyUser = GuestUser | AuthUser;

// ── Session State ─────────────────────────────────────────────────────────────

/**
 * Lifecycle states for the auth session.
 */
export type AuthSessionState =
  | "initializing"  // Session is being restored or initialized
  | "guest"         // User is in guest mode
  | "authenticated" // User is authenticated
  | "transitioning" // Guest → account migration in progress
  | "signed_out";   // User has signed out

/**
 * Lifecycle states for account transition (guest → authenticated).
 */
export type AuthTransitionState =
  | "idle"           // No transition in progress
  | "preparing"      // Preparing migration plan
  | "migrating"      // Data migration in progress
  | "completing"     // Finalizing migration
  | "completed"      // Migration complete
  | "failed";        // Migration failed

// ── Repository Context ────────────────────────────────────────────────────────

/**
 * Context passed to repositories to establish ownership boundaries.
 * Repositories must never infer ownership from global state.
 *
 * This ensures:
 * - Data isolation between guest and authenticated users
 * - Safe guest → account migration
 * - Clear ownership audit trail
 */
export interface RepositoryContext {
  /** Current account mode */
  accountMode: AccountMode;
  /** Stable local owner ID (always present) */
  localOwnerId: LocalOwnerId;
  /** Cloud owner ID (present only when authenticated) */
  cloudOwnerId?: CloudOwnerId;
  /** Storage partition key for this context */
  storagePartitionKey: string;
  /** Sync queue partition key for this context */
  syncPartitionKey: string;
  /** Whether a migration is currently in progress */
  isMigrating: boolean;
}

// ── User ID Types ─────────────────────────────────────────────────────────────

/**
 * Generic user ID that can be either local or cloud.
 * Used in contexts where the distinction doesn't matter.
 */
export type UserId = string;

/**
 * Discriminated union for user ID types.
 */
export type LocalOrCloudUserId =
  | { type: "local"; id: LocalOwnerId }
  | { type: "cloud"; id: CloudOwnerId };

// ── Migration Types ───────────────────────────────────────────────────────────

/**
 * Strategy for handling conflicts during guest → account migration.
 */
export type ConflictStrategy =
  | "guest_wins"    // Keep guest data, discard any cloud data
  | "cloud_wins"    // Use cloud data, discard guest data
  | "merge"         // Attempt to merge both datasets
  | "manual";       // Require user to resolve conflicts

/**
 * Plan for migrating guest data to authenticated account.
 */
export interface AccountMigrationPlan {
  /** Source local owner ID */
  sourceLocalOwnerId: LocalOwnerId;
  /** Target cloud owner ID */
  targetCloudOwnerId: CloudOwnerId;
  /** Storage partitions affected by migration */
  affectedStoragePartitions: string[];
  /** Sync queue partitions affected by migration */
  affectedSyncQueuePartitions: string[];
  /** Entity types to migrate */
  entitiesToMigrate: string[];
  /** Strategy for handling conflicts */
  conflictStrategy: ConflictStrategy;
  /** Timestamp when plan was created */
  createdAt: string;
  /** Timestamp when migration started (null if not started) */
  startedAt: string | null;
  /** Timestamp when migration completed (null if not completed) */
  completedAt: string | null;
}
