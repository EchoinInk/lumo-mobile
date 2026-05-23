/**
 * Ownership Contract
 *
 * Canonical base type for all user-owned entities.
 * Every entity that persists to the sync queue or Supabase MUST extend this.
 *
 * Core principle:
 *   Data is stamped with its owner at CREATION TIME.
 *   Ownership is immutable post-creation.
 *   No entity may exist without a declared owner.
 */

/**
 * Base shape for any entity that belongs to a user.
 *
 * userId:    The authenticated user who created and owns this record.
 * createdAt: ISO 8601 timestamp — set at creation, never mutated.
 * updatedAt: ISO 8601 timestamp — updated on every write.
 */
export interface OwnedEntity {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Owned entity with an optional userId.
 * Used when the entity may have been created before the user authenticated
 * (anonymous/local-first mode). The userId is stamped in when the user
 * later signs in and claims local data.
 */
export interface MaybeOwnedEntity extends Omit<OwnedEntity, 'userId'> {
  userId: string | null;
}
