/**
 * Supabase Auth Mapper
 *
 * Maps Supabase auth types to canonical auth types.
 * Never exposes raw Supabase user objects outside auth layer.
 *
 * Canonical types are the source of truth for the app.
 * Supabase types are mapped immediately upon entering the auth layer.
 */

import type {
    AuthUser,
    CloudOwnerId,
    LocalOwnerId,
    RepositoryContext,
} from "@/features/auth/types/auth.types";
import type { User } from "@supabase/supabase-js";
import type { SupabaseAuthSession } from "./supabaseAuth.types";

/**
 * Map Supabase user to canonical AuthUser.
 *
 * @param supabaseUser - Supabase user object
 * @param localOwnerId - Local owner ID (preserved from guest mode or generated)
 * @returns Canonical AuthUser
 */
export function mapSupabaseUserToAuthUser(
  supabaseUser: User,
  localOwnerId: LocalOwnerId,
): AuthUser {
  return {
    type: "authenticated",
    localOwnerId,
    cloudOwnerId: supabaseUser.id as CloudOwnerId,
    email: supabaseUser.email,
    displayName: supabaseUser.user_metadata?.display_name,
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
    createdAt: supabaseUser.created_at,
  };
}

/**
 * Map Supabase session to RepositoryContext.
 *
 * @param session - Supabase auth session
 * @param localOwnerId - Local owner ID (preserved from guest mode or generated)
 * @returns RepositoryContext for authenticated user
 */
export function mapSupabaseSessionToRepositoryContext(
  session: SupabaseAuthSession,
  localOwnerId: LocalOwnerId,
): RepositoryContext {
  if (!session.user || !session.isValid) {
    throw new Error("[Mapper] Cannot map invalid session to RepositoryContext");
  }

  const cloudOwnerId = session.user.id as CloudOwnerId;

  return {
    accountMode: "authenticated",
    localOwnerId,
    cloudOwnerId,
    storagePartitionKey: `user:${cloudOwnerId}`,
    syncPartitionKey: `user:${cloudOwnerId}:syncQueue`,
    isMigrating: false,
  };
}

/**
 * Map Supabase session to canonical AuthUser.
 *
 * @param session - Supabase auth session
 * @returns Canonical AuthUser or null if no user
 */
export function mapSupabaseSessionToAuthUser(
  session: SupabaseAuthSession,
): AuthUser | null {
  if (!session.user || !session.isValid) {
    return null;
  }

  return mapSupabaseUserToAuthUser(session.user);
}

/**
 * Extract cloud owner ID from Supabase user.
 *
 * @param supabaseUser - Supabase user object
 * @returns Cloud owner ID
 */
export function extractCloudOwnerId(supabaseUser: User): CloudOwnerId {
  return supabaseUser.id as CloudOwnerId;
}

/**
 * Extract email from Supabase user.
 *
 * @param supabaseUser - Supabase user object
 * @returns Email or null if not available
 */
export function extractEmail(supabaseUser: User): string | null {
  return supabaseUser.email ?? null;
}
