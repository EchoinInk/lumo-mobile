/**
 * Query Client
 *
 * Single React Query client instance.
 * Configured for calm, conservative behavior.
 */

import { QueryClient } from "@tanstack/react-query";
import { mutationCache, queryCache, queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  queryCache,
  mutationCache,
});

/**
 * Reset query client (useful for logout/testing)
 */
export const resetQueryClient = () => {
  queryClient.clear();
};

/**
 * Invalidate all queries
 */
export const invalidateAllQueries = async () => {
  await queryClient.invalidateQueries();
};

/**
 * Invalidate specific feature queries
 */
export const invalidateFeatureQueries = async (
  feature: keyof typeof queryKeys,
) => {
  await queryClient.invalidateQueries({
    queryKey: [feature],
  });
};
