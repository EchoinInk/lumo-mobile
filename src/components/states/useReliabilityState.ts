/**
 * useReliabilityState Hook
 *
 * Hook for managing reliability states in feature screens.
 * Provides consistent state management for loading, empty, error, offline, syncing, and retrying states.
 */

import { useState, useCallback, useEffect } from "react";
import type {
  ReliabilityState,
  ReliabilityStateConfig,
  ReliabilityStateMetadata,
} from "./reliability.types";

interface UseReliabilityStateProps {
  initialState?: ReliabilityState;
  config?: ReliabilityStateConfig;
}

interface UseReliabilityStateReturn {
  state: ReliabilityState;
  metadata: ReliabilityStateMetadata;
  setState: (state: ReliabilityState, error?: string) => void;
  setLoading: () => void;
  setEmpty: () => void;
  setSuccess: () => void;
  setError: (error: string) => void;
  setOffline: () => void;
  setSyncing: () => void;
  setRetrying: () => void;
  isLoading: boolean;
  isEmpty: boolean;
  isSuccess: boolean;
  isError: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  isRetrying: boolean;
  canRetry: boolean;
  retry: () => void;
}

export function useReliabilityState({
  initialState = "loading",
  config = {},
}: UseReliabilityStateProps = {}): UseReliabilityStateReturn {
  const [state, setStateInternal] = useState<ReliabilityState>(initialState);
  const [metadata, setMetadata] = useState<ReliabilityStateMetadata>({
    state: initialState,
    retryCount: 0,
  });

  const setState = useCallback((newState: ReliabilityState, error?: string) => {
    setStateInternal(newState);
    setMetadata((prev) => ({
      ...prev,
      state: newState,
      error,
      lastSyncAt: newState === "success" ? new Date().toISOString() : prev.lastSyncAt,
    }));
  }, []);

  const setLoading = useCallback(() => setState("loading"), [setState]);
  const setEmpty = useCallback(() => setState("empty"), [setState]);
  const setSuccess = useCallback(() => setState("success"), [setState]);
  const setError = useCallback((error: string) => setState("error", error), [setState]);
  const setOffline = useCallback(() => setState("offline"), [setState]);
  const setSyncing = useCallback(() => setState("syncing"), [setState]);
  const setRetrying = useCallback(() => {
    setMetadata((prev) => ({
      ...prev,
      retryCount: (prev.retryCount || 0) + 1,
    }));
    setState("retrying");
  }, [setState]);

  const retry = useCallback(() => {
    setRetrying();
  }, [setRetrying]);

  const isLoading = state === "loading";
  const isEmpty = state === "empty";
  const isSuccess = state === "success";
  const isError = state === "error";
  const isOffline = state === "offline";
  const isSyncing = state === "syncing";
  const isRetrying = state === "retrying";

  const canRetry = isError && (config.showRetry !== false);

  return {
    state,
    metadata,
    setState,
    setLoading,
    setEmpty,
    setSuccess,
    setError,
    setOffline,
    setSyncing,
    setRetrying,
    isLoading,
    isEmpty,
    isSuccess,
    isError,
    isOffline,
    isSyncing,
    isRetrying,
    canRetry,
    retry,
  };
}
