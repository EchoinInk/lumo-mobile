/**
 * Auth Session Store
 *
 * Zustand store for auth session state and ownership identity.
 * Wired to Supabase Auth for session management.
 *
 * Responsibilities:
 * - Track current account mode (guest vs authenticated)
 * - Maintain stable localOwnerId for guest mode
 * - Maintain cloudOwnerId for authenticated mode
 * - Track session and transition states
 * - Track guest migration completion status
 * - Hydrate and restore Supabase sessions
 * - Handle sign-out
 *
 * NOT responsible for:
 * - Feature entity state (owned by feature stores)
 * - Direct Supabase SDK usage (uses auth layer abstraction)
 *
 * Persisted to MMKV via Zustand persist middleware.
 * Follows existing storage patterns from createPersistStorage.
 */

import { createPersistStorage } from "@/store/createPersistStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
    AccountMode,
    AuthSessionState,
    AuthTransitionState,
    CloudOwnerId,
    LocalOwnerId
} from "../types/auth.types";

// ── State ─────────────────────────────────────────────────────────────────────

interface AuthSessionStoreState {
  /** Current account mode */
  accountMode: AccountMode;
  /** Stable local owner ID (always present) */
  localOwnerId: LocalOwnerId | null;
  /** Cloud owner ID (present only when authenticated) */
  cloudOwnerId: CloudOwnerId | null;
  /** Current session lifecycle state */
  sessionStatus: AuthSessionState;
  /** Current account transition state */
  transitionStatus: AuthTransitionState;
  /** True once guest → account migration has completed */
  hasCompletedGuestMigration: boolean;
  /** True once the store has hydrated from storage */
  hasHydrated: boolean;
}

// ── Actions ───────────────────────────────────────────────────────────────────

interface AuthSessionActions {
  /** Set hasHydrated flag (called by persist middleware) */
  setHasHydrated: (value: boolean) => void;

  /**
   * Initialize guest session.
   * Generates or restores a stable localOwnerId.
   */
  setGuestSession: (localOwnerId: LocalOwnerId) => void;

  /**
   * Set authenticated session.
   * Requires both localOwnerId (from guest state) and cloudOwnerId (from Supabase).
   */
  setAuthenticatedSession: (
    localOwnerId: LocalOwnerId,
    cloudOwnerId: CloudOwnerId,
  ) => void;

  /**
   * Begin guest → account migration.
   * Sets transition status to 'preparing'.
   */
  beginAccountTransition: () => void;

  /**
   * Complete guest → account migration.
   * Sets transition status to 'completed' and marks migration as done.
   */
  completeAccountTransition: () => void;

  /**
   * Reset auth session to initial state.
   * Used for sign-out or testing.
   */
  resetAuthSession: () => void;
}

type AuthSessionStore = AuthSessionStoreState & AuthSessionActions;

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: AuthSessionStoreState = {
  accountMode: "guest",
  localOwnerId: null,
  cloudOwnerId: null,
  sessionStatus: "initializing",
  transitionStatus: "idle",
  hasCompletedGuestMigration: false,
  hasHydrated: false,
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthSessionStore = create<AuthSessionStore>()(
  persist(
    (set) => ({
      ...initialState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setGuestSession: (localOwnerId) =>
        set({
          accountMode: "guest",
          localOwnerId,
          cloudOwnerId: null,
          sessionStatus: "guest",
          transitionStatus: "idle",
        }),

      setAuthenticatedSession: (localOwnerId, cloudOwnerId) =>
        set({
          accountMode: "authenticated",
          localOwnerId,
          cloudOwnerId,
          sessionStatus: "authenticated",
          transitionStatus: "idle",
        }),

      beginAccountTransition: () =>
        set({
          transitionStatus: "preparing",
          sessionStatus: "transitioning",
        }),

      completeAccountTransition: () =>
        set({
          transitionStatus: "completed",
          sessionStatus: "authenticated",
          hasCompletedGuestMigration: true,
        }),

      resetAuthSession: () =>
        set({
          ...initialState,
          sessionStatus: "signed_out",
        }),
    }),
    {
      name: "auth-session-storage",
      storage: createJSONStorage(() => createPersistStorage()),
      partialize: (state) => ({
        accountMode: state.accountMode,
        localOwnerId: state.localOwnerId,
        cloudOwnerId: state.cloudOwnerId,
        hasCompletedGuestMigration: state.hasCompletedGuestMigration,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// ── Selectors ─────────────────────────────────────────────────────────────────

/** True when the user is in guest mode. */
export const selectIsGuest = (state: AuthSessionStoreState): boolean =>
  state.accountMode === "guest";

/** True when the user is authenticated. */
export const selectIsAuthenticated = (state: AuthSessionStoreState): boolean =>
  state.accountMode === "authenticated" && state.cloudOwnerId !== null;

/** True when a migration is in progress. */
export const selectIsMigrating = (state: AuthSessionStoreState): boolean =>
  state.transitionStatus !== "idle" &&
  state.transitionStatus !== "completed" &&
  state.transitionStatus !== "failed";

/** True when the session has not yet hydrated from storage. */
export const selectIsLoading = (state: AuthSessionStoreState): boolean =>
  !state.hasHydrated || state.sessionStatus === "initializing";

/** True when the session is settled (not loading or transitioning). */
export const selectIsSettled = (state: AuthSessionStoreState): boolean =>
  state.hasHydrated &&
  state.sessionStatus !== "initializing" &&
  state.sessionStatus !== "transitioning";
