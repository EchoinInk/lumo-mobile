/**
 * Supabase Auth Layer
 *
 * Public API for Supabase auth integration.
 * All Supabase-specific code is isolated in this directory.
 *
 * Import from here:
 *   import { getCurrentSession, signOutSession } from '@/services/api/auth';
 *
 * Never import Supabase SDK directly outside this layer.
 */

// Re-export auth configuration
export {
  getSupabaseConfig,
  isSupabaseConfigured,
  resetAuthConfig,
} from "./auth.config";

// Re-export auth session operations
export {
  getCurrentSession,
  refreshSession,
  signOutSession,
  restorePersistedSession,
  subscribeToAuthChanges,
} from "./supabaseAuth.session";

// Re-export auth mappers
export {
  mapSupabaseUserToAuthUser,
  mapSupabaseSessionToRepositoryContext,
  mapSupabaseSessionToAuthUser,
  extractCloudOwnerId,
  extractEmail,
} from "./supabaseAuth.mapper";

// Re-export types (for internal use only)
export type {
  SupabaseAuthSession,
  SupabaseAuthError,
  SupabaseAuthResult,
  SupabaseAuthConfig,
} from "./supabaseAuth.types";
