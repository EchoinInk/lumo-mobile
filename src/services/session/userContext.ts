/**
 * User Context Resolver
 *
 * Single source of truth for authenticated identity at the service layer.
 * Resolves the current user from the session — no store access, no UI coupling.
 *
 * Responsibilities:
 * - Provide userId + accessToken for repository / sync operations
 * - Determine whether a session is active
 *
 * NOT responsible for:
 * - Storing state (no Zustand usage)
 * - Routing or UI side effects
 * - Auth mutations (use auth.ts for sign-in/sign-up)
 */

import { getCurrentUserId, getAccessToken } from '../api/session';

export type UserContext = {
  userId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
};

/**
 * Resolve the current user context from the active session.
 *
 * Returns null userId/token when no session exists — never throws.
 * Callers must check `isAuthenticated` before using userId.
 */
export async function getUserContext(): Promise<UserContext> {
  const userId = await getCurrentUserId();
  const accessToken = await getAccessToken();
  return {
    userId,
    accessToken,
    isAuthenticated: !!userId && !!accessToken,
  };
}
