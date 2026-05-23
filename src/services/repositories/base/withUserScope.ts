/**
 * User Scope Guard
 *
 * Central enforcement: no entity may leave the repository layer
 * without an explicit userId stamp.
 *
 * Usage:
 *   const ownedTask = withUserScope(userId, rawTask);
 *   // ownedTask.userId === userId — always
 *
 * This is NOT an auth check — it is an ownership stamp.
 * The caller is responsible for ensuring userId is valid
 * before calling this function.
 */

/**
 * Stamp an entity with the given userId.
 *
 * Overwrites any existing userId on the entity — ownership
 * is always determined by the caller at creation time.
 *
 * @param userId  - The authenticated user's ID
 * @param entity  - The entity to stamp
 * @returns       A new object with userId guaranteed to be set
 */
export function withUserScope<T extends { userId?: string | null }>(
  userId: string,
  entity: T,
): T & { userId: string } {
  return {
    ...entity,
    userId,
  };
}

/**
 * Assert that a userId is present before performing a scoped operation.
 * Throws a descriptive error if the userId is absent.
 *
 * Use this at the top of repository methods that require authentication.
 *
 * @param userId   - The user ID to validate
 * @param context  - Description of the operation (for error messages)
 */
export function assertUserScope(
  userId: string | null | undefined,
  context: string,
): asserts userId is string {
  if (!userId) {
    throw new Error(
      `[UserScope] ${context} requires an authenticated user. userId is missing.`,
    );
  }
}
