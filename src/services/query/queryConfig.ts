/**
 * Query Configuration
 *
 * Calm, conservative React Query configuration.
 * Predictable, battery-conscious, offline-safe defaults.
 */

import { MutationCache, QueryCache } from "@tanstack/react-query";

export const queryConfig = {
  queries: {
    // Calm refetching - not aggressive
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,

    // Retry restraint - not aggressive
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors
      if (
        error &&
        typeof error === "object" &&
        error !== null &&
        "status" in error
      ) {
        const status = (error as { status?: number }).status;
        if (typeof status === "number" && status >= 400 && status < 500) {
          return false;
        }
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Mutations should be instant locally
    retry: false,
  },
};

export const queryCache = new QueryCache({
  onError: (error) => {
    console.error("Query cache error:", error);
  },
});

export const mutationCache = new MutationCache({
  onError: (error) => {
    console.error("Mutation cache error:", error);
  },
});
