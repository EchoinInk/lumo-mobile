/**
 * Auth Service
 *
 * Handles all authentication operations against Supabase.
 * UI code should NEVER call this directly — use the auth store or hooks.
 *
 * Flow: Screen → Hook → Auth Store → Auth Service → Supabase
 */

import { supabase } from '@/services/api/supabase';
import type { ApiResponse } from '@/types/api';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type {
    AuthSession,
    AuthUser,
    SignInCredentials,
    SignUpCredentials,
} from '../types/auth';

/**
 * Map Supabase user + session to app domain types.
 */
function mapSession(
  user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string },
  session: { access_token: string; refresh_token: string; expires_at?: number }
): AuthSession {
  const authUser: AuthUser = {
    id: user.id,
    email: user.email ?? '',
    displayName: (user.user_metadata?.display_name as string) ?? undefined,
    avatarUrl: (user.user_metadata?.avatar_url as string) ?? undefined,
    createdAt: user.created_at ?? new Date().toISOString(),
  };

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? 0,
    user: authUser,
  };
}

/**
 * Sign in with email and password.
 */
export async function signIn(
  credentials: SignInCredentials
): Promise<ApiResponse<AuthSession>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error || !data.session || !data.user) {
    return {
      data: null,
      error: {
        message: error?.message ?? 'Sign in failed',
        code: error?.code,
        status: error?.status,
      },
    };
  }

  return {
    data: mapSession(data.user, data.session),
    error: null,
  };
}

/**
 * Sign up with email and password.
 */
export async function signUp(
  credentials: SignUpCredentials
): Promise<ApiResponse<AuthSession>> {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        display_name: credentials.displayName,
      },
    },
  });

  if (error || !data.session || !data.user) {
    return {
      data: null,
      error: {
        message: error?.message ?? 'Sign up failed',
        code: error?.code,
        status: error?.status,
      },
    };
  }

  return {
    data: mapSession(data.user, data.session),
    error: null,
  };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<ApiResponse<null>> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      data: null,
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
      },
    };
  }

  return { data: null, error: null };
}

/**
 * Restore the current session from secure storage.
 * Called on app startup for session hydration.
 */
export async function restoreSession(): Promise<ApiResponse<AuthSession>> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return {
      data: null,
      error: error
        ? {
            message: error.message,
            code: error.code,
            status: error.status,
          }
        : { message: 'No active session' },
    };
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return {
      data: null,
      error: { message: 'Could not retrieve user' },
    };
  }

  return {
    data: mapSession(userData.user, data.session),
    error: null,
  };
}

/**
 * Listen for auth state changes (token refresh, sign out from another tab, etc.)
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (session: AuthSession | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      if (!session) {
        callback(null);
        return;
      }

      // We need user info — pull from session.user
      const authSession = mapSession(session.user, session);
      callback(authSession);
    }
  );

  return () => {
    data.subscription.unsubscribe();
  };
}
