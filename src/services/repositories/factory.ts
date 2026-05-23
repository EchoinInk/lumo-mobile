/**
 * Repository Context Factory
 *
 * Resolves the current user context once and makes it available
 * to all repository operations. Inject this instead of calling
 * getUserContext() in every repository method.
 *
 * Usage (in a sync repository):
 *   const ctx = await createRepositoryContext();
 *   const ownedTask = withUserScope(ctx.userId, task);
 *   createQueueItem({ ...ownedTask, userId: ctx.userId });
 *
 * Local-first mode:
 *   When no user is authenticated, userId will be null.
 *   Repositories in local-only mode should tolerate this.
 *   Sync repositories should guard with assertUserScope() when
 *   a userId is strictly required.
 */

import { getUserContext } from '../session/userContext';

export interface RepositoryContext {
  userId: string;
  accessToken: string | null;
}

/**
 * Create a repository context for an authenticated operation.
 *
 * Throws if no user session exists — use only in paths that
 * require authentication (sync writes, cloud reads).
 */
export async function createRepositoryContext(): Promise<RepositoryContext> {
  const ctx = await getUserContext();
  if (!ctx.userId) {
    throw new Error(
      '[RepositoryFactory] No active user session. ' +
        'Sign in before performing authenticated operations.',
    );
  }
  return {
    userId: ctx.userId,
    accessToken: ctx.accessToken,
  };
}

/**
 * Create a repository context that tolerates anonymous mode.
 *
 * Use for operations that work locally without auth but stamp
 * ownership when a user is available.
 */
export async function createOptionalRepositoryContext(): Promise<{
  userId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}> {
  return getUserContext();
}
