/**
 * Session Service
 *
 * Manages the Supabase auth session lifecycle.
 * No UI logic. No store mutations. Pure session infrastructure.
 *
 * Responsibilities:
 * - Restore session from secure storage on app start
 * - Subscribe to auth state changes
 * - Expose current session / token
 * - Unsubscribe from listeners on teardown
 *
 * Flow: SessionProvider → restoreSession() → useAuthStore
 *       Supabase auth state changes → onAuthStateChange → useAuthStore
 */

import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { env } from '@/config/env';

// ── Session Types ─────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface RestoredSession {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

export type AuthStateCallback = (
  event: AuthChangeEvent,
  user: SessionUser | null,
) => void;

// ── Session Restoration ───────────────────────────────────────────────────

/**
 * Restore the session from secure storage.
 *
 * Called once at app startup. Does NOT throw.
 * Returns the current user if a valid session exists.
 */
export async function restoreSession(): Promise<RestoredSession> {
  if (!env.isConfigured || !supabase) {
    return { user: null, isAuthenticated: false };
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('[Session] Failed to restore session:', error.message);
      return { user: null, isAuthenticated: false };
    }

    if (!data.session?.user) {
      return { user: null, isAuthenticated: false };
    }

    const { user } = data.session;
    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        createdAt: user.created_at ?? new Date().toISOString(),
      },
      isAuthenticated: true,
    };
  } catch (err) {
    console.warn('[Session] Unexpected error restoring session:', err);
    return { user: null, isAuthenticated: false };
  }
}

// ── Auth State Listener ───────────────────────────────────────────────────

/**
 * Subscribe to Supabase auth state changes.
 *
 * Fires the callback whenever the user signs in, signs out,
 * or the token is refreshed.
 *
 * @returns Unsubscribe function — call on component unmount.
 */
export function subscribeToAuthChanges(callback: AuthStateCallback): () => void {
  if (!env.isConfigured || !supabase) {
    return () => {};
  }

  const { data: subscription } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      const user = session?.user
        ? {
            id: session.user.id,
            email: session.user.email ?? '',
            createdAt: session.user.created_at ?? new Date().toISOString(),
          }
        : null;

      callback(event, user);
    },
  );

  return () => {
    subscription.subscription.unsubscribe();
  };
}

// ── Token Access ──────────────────────────────────────────────────────────

/**
 * Get the current access token, if a session is active.
 * Returns null when not authenticated or Supabase not configured.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!env.isConfigured || !supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the currently authenticated user ID, if any.
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!env.isConfigured || !supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
