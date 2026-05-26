/**
 * Auth Guard Hook
 *
 * Hook for checking auth state and determining if access should be granted.
 * Provides the same logic as AuthGuard component but as a hook for
 * programmatic access control.
 *
 * This is architecture-only - no polished auth screens in this phase.
 */

import { useMemo } from "react";
import { useAuthSessionStore, selectIsGuest, selectIsAuthenticated, selectIsMigrating, selectIsLoading } from "../store/useAuthSessionStore";

export type AuthGuardMode =
  | "requireGuest"
  | "requireAuthenticated"
  | "allowGuest"
  | "allowDuringMigration";

interface UseAuthGuardResult {
  /** Whether the auth check passes */
  canAccess: boolean;
  /** Whether the session is still loading */
  isLoading: boolean;
  /** Whether the user is in guest mode */
  isGuest: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether a migration is in progress */
  isMigrating: boolean;
  /** Appropriate fallback message if access is denied */
  fallbackMessage: string;
}

/**
 * Hook for checking auth state and determining access.
 *
 * @param mode - The auth mode to enforce
 */
export function useAuthGuard(mode: AuthGuardMode = "allowGuest"): UseAuthGuardResult {
  const isLoading = useAuthSessionStore(selectIsLoading);
  const isGuest = useAuthSessionStore(selectIsGuest);
  const isAuthenticated = useAuthSessionStore(selectIsAuthenticated);
  const isMigrating = useAuthSessionStore(selectIsMigrating);

  const canAccess = useMemo(() => {
    // If loading, deny access
    if (isLoading) {
      return false;
    }

    // Check auth requirements based on mode
    switch (mode) {
      case "requireGuest":
        return isGuest && !isMigrating;
      case "requireAuthenticated":
        return isAuthenticated && !isMigrating;
      case "allowGuest":
        return isGuest || isAuthenticated;
      case "allowDuringMigration":
        return isGuest || isAuthenticated || isMigrating;
    }
  }, [isLoading, isGuest, isAuthenticated, isMigrating, mode]);

  const fallbackMessage = useMemo(() => {
    return getFallbackMessage(mode, isGuest, isAuthenticated, isMigrating);
  }, [mode, isGuest, isAuthenticated, isMigrating]);

  return {
    canAccess,
    isLoading,
    isGuest,
    isAuthenticated,
    isMigrating,
    fallbackMessage,
  };
}

/**
 * Get appropriate fallback message based on auth state and mode.
 */
function getFallbackMessage(
  mode: AuthGuardMode,
  isGuest: boolean,
  isAuthenticated: boolean,
  isMigrating: boolean,
): string {
  if (isMigrating) {
    return "Please wait while your account is being set up.";
  }

  switch (mode) {
    case "requireGuest":
      return "This feature is only available in guest mode.";
    case "requireAuthenticated":
      return "Please sign in to access this feature.";
    case "allowGuest":
    case "allowDuringMigration":
      return "Unable to access this feature at this time.";
  }
}
