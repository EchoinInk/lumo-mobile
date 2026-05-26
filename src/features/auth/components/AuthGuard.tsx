/**
 * Auth Guard Component
 *
 * Minimal auth guard for protecting routes and features.
 * Returns calm fallback states using existing feedback primitives.
 *
 * This is architecture-only - no polished auth screens in this phase.
 *
 * Supported modes:
 * - requireGuest: Allow only guest users
 * - requireAuthenticated: Allow only authenticated users
 * - allowGuest: Allow both guest and authenticated users
 * - allowDuringMigration: Allow access during guest → account migration
 */

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import React from "react";
import { View } from "react-native";
import {
    selectIsAuthenticated,
    selectIsGuest,
    selectIsLoading,
    selectIsMigrating,
    useAuthSessionStore,
} from "../store/useAuthSessionStore";

export type AuthGuardMode =
  | "requireGuest"
  | "requireAuthenticated"
  | "allowGuest"
  | "allowDuringMigration";

interface AuthGuardProps {
  /** The auth mode to enforce */
  mode?: AuthGuardMode;
  /** Children to render when auth check passes */
  children: React.ReactNode;
  /** Optional fallback component when auth check fails */
  fallback?: React.ReactNode;
}

/**
 * Auth guard component that conditionally renders children based on auth state.
 */
export function AuthGuard({
  mode = "allowGuest",
  children,
  fallback,
}: AuthGuardProps) {
  const isLoading = useAuthSessionStore(selectIsLoading);
  const isGuest = useAuthSessionStore(selectIsGuest);
  const isAuthenticated = useAuthSessionStore(selectIsAuthenticated);
  const isMigrating = useAuthSessionStore(selectIsMigrating);

  // Show loading state while session is hydrating
  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  // Check auth requirements based on mode
  let shouldRender = false;

  switch (mode) {
    case "requireGuest":
      shouldRender = isGuest && !isMigrating;
      break;
    case "requireAuthenticated":
      shouldRender = isAuthenticated && !isMigrating;
      break;
    case "allowGuest":
      shouldRender = isGuest || isAuthenticated;
      break;
    case "allowDuringMigration":
      shouldRender = isGuest || isAuthenticated || isMigrating;
      break;
  }

  // Render fallback if auth check fails
  if (!shouldRender) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback based on mode
    const description = getFallbackMessage(
      mode,
      isGuest,
      isAuthenticated,
      isMigrating,
    );
    return (
      <View style={{ flex: 1 }}>
        <EmptyState title="Access Restricted" description={description} />
      </View>
    );
  }

  // Render children if auth check passes
  return <>{children}</>;
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
