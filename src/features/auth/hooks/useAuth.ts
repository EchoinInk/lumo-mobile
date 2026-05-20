/**
 * Auth Hook
 *
 * Thin hook for screens to consume auth state and actions.
 * Follows the pattern: Screen → Hook → Store → Service → Supabase
 */

import { useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { SignInCredentials, SignUpCredentials } from '../types/auth';

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const error = useAuthStore((s) => s.error);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const clearError = useCallback(() => {
    useAuthStore.getState().setError(null);
  }, []);

  return {
    // State
    status,
    user,
    error,
    isHydrated,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || status === 'restoring',

    // Actions
    signIn: useCallback(
      (credentials: SignInCredentials) => signIn(credentials),
      [signIn]
    ),
    signUp: useCallback(
      (credentials: SignUpCredentials) => signUp(credentials),
      [signUp]
    ),
    signOut,
    restoreSession,
    clearError,
  };
}
