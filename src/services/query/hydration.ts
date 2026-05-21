/**
 * Query Hydration
 *
 * Hydration helpers for server-side rendering and persistence.
 * Not currently used in React Native, but available for future needs.
 */

import { dehydrate } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

/**
 * Dehydrate query client for persistence
 */
export const dehydrateQueries = () => {
  return dehydrate(queryClient);
};

/**
 * Hydrate query client from persisted state
 */
export const hydrateQueries = (dehydratedState: unknown) => {
  queryClient.setQueryData(["hydration"], dehydratedState);
};
