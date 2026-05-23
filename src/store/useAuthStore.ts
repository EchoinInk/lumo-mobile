/**
 * Auth Store
 *
 * Canonical Zustand store for authentication state.
 * Single source of truth for identity, session, and auth status.
 *
 * Responsibilities:
 * - Current user
 * - Auth status lifecycle
 * - Session hydration state
 * - Onboarding completion
 *
 * NOT responsible for:
 * - Queue state (owned by syncQueue / MMKV)
 * - Feature entities (owned by feature stores)
 * - Sync items (owned by syncProcessor)
 * - Any network calls (owned by auth.ts / session.ts)
 *
 * Persisted to MMKV via Zustand persist middleware.
 * Hydration happens in SessionProvider on app start.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createPersistStorage } from "./createPersistStorage";

// ── Auth Status ───────────────────────────────────────────────────────────

/**
 * Lifecycle of the auth identity:
 * - loading      : session restoration in progress (app start)
 * - authenticated: signed-in user with valid session
 * - anonymous    : using app without an account (local-first mode)
 * - signed_out   : previously authenticated, now signed out
 */
export type AuthStatus =
  | "loading"
  | "authenticated"
  | "anonymous"
  | "signed_out";

// ── User ─────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

// ── State + Actions ──────────────────────────────────────────────────────

interface AuthState {
  /** Current authenticated user, or null if anonymous/signed-out */
  user: AuthUser | null;
  /** Auth lifecycle status */
  status: AuthStatus;
  /** True once the initial session restore has completed */
  hasHydrated: boolean;
  /** True once the user has completed onboarding flow */
  hasCompletedOnboarding: boolean;
  /** Last auth error message, if any */
  error: string | null;
}

interface AuthActions {
  /** Called after session restore resolves (success or not) */
  setHydrated: () => void;
  /** Set authenticated user */
  setUser: (user: AuthUser) => void;
  /** Clear user and mark signed out */
  clearUser: () => void;
  /** Set auth status directly (used by session listener) */
  setStatus: (status: AuthStatus) => void;
  /** Mark onboarding as complete */
  completeOnboarding: () => void;
  /** Store an auth error */
  setError: (error: string | null) => void;
  /** Clear stored error */
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ── Initial State ─────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  status: "loading",
  hasHydrated: false,
  hasCompletedOnboarding: false,
  error: null,
};

// ── Store ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setHydrated: () => set({ hasHydrated: true }),

      setUser: (user) =>
        set({
          user,
          status: "authenticated",
          error: null,
        }),

      clearUser: () =>
        set({
          user: null,
          status: "signed_out",
        }),

      setStatus: (status) => set({ status }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => createPersistStorage()),
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);

// ── Selectors ─────────────────────────────────────────────────────────────

/** True when the user is authenticated (has a valid session). */
export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.status === "authenticated" && state.user !== null;

/** True when the session restore has not yet completed. */
export const selectIsLoading = (state: AuthState): boolean =>
  state.status === "loading" || !state.hasHydrated;

/** True when the app is in local-first anonymous mode. */
export const selectIsAnonymous = (state: AuthState): boolean =>
  state.status === "anonymous";

/** True when auth is settled (not in loading state). */
export const selectIsSettled = (state: AuthState): boolean =>
  state.hasHydrated && state.status !== "loading";
