/**
 * Auth Store
 *
 * Zustand store for authentication state.
 * Coordinates between UI and auth service.
 *
 * Flow: Screen → Hook → useAuthStore → authService → Supabase
 *
 * Hydration:
 *   On app launch, call restoreSession() to check for an existing session.
 *   The store starts in 'idle' status and transitions to 'restoring' → 'authenticated' or 'unauthenticated'.
 */

import { create } from 'zustand';
import type { AuthStore } from '../types/auth';
import * as authService from '../services/authService';

const initialState = {
  status: 'idle' as const,
  user: null,
  session: null,
  error: null,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  signIn: async (credentials) => {
    set({ status: 'loading', error: null });

    const result = await authService.signIn(credentials);

    if (result.error || !result.data) {
      set({
        status: 'unauthenticated',
        error: result.error?.message ?? 'Sign in failed',
      });
      return;
    }

    set({
      status: 'authenticated',
      user: result.data.user,
      session: result.data,
      error: null,
    });
  },

  signUp: async (credentials) => {
    set({ status: 'loading', error: null });

    const result = await authService.signUp(credentials);

    if (result.error || !result.data) {
      set({
        status: 'unauthenticated',
        error: result.error?.message ?? 'Sign up failed',
      });
      return;
    }

    set({
      status: 'authenticated',
      user: result.data.user,
      session: result.data,
      error: null,
    });
  },

  signOut: async () => {
    const result = await authService.signOut();

    if (result.error) {
      set({ error: result.error.message });
      return;
    }

    set({
      status: 'unauthenticated',
      user: null,
      session: null,
      error: null,
    });
  },

  restoreSession: async () => {
    // Prevent double-restore
    if (get().status === 'restoring') return;

    set({ status: 'restoring', error: null });

    const result = await authService.restoreSession();

    if (result.error || !result.data) {
      set({
        status: 'unauthenticated',
        user: null,
        session: null,
        error: null,
        isHydrated: true,
      });
      return;
    }

    set({
      status: 'authenticated',
      user: result.data.user,
      session: result.data,
      error: null,
      isHydrated: true,
    });
  },

  setError: (error) => set({ error }),

  clearAuth: () => set(initialState),

  setHydrated: () => set({ isHydrated: true }),
}));
