/**
 * Onboarding Query Hooks
 * 
 * React Query hooks for onboarding feature.
 * Remote cache for Supabase data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query';

// Mock fetch function - replace with actual repository call
const fetchOnboardingStatus = async () => {
  // TODO: Replace with actual repository call
  return { completed: false, step: 'welcome' };
};

const fetchOnboardingProgress = async () => {
  // TODO: Replace with actual repository call
  return { step: 'welcome', completedSteps: [] };
};

/**
 * Query for onboarding status
 */
export const useOnboardingStatusQuery = () => {
  return useQuery({
    queryKey: queryKeys.onboarding.status(),
    queryFn: fetchOnboardingStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Query for onboarding progress
 */
export const useOnboardingProgressQuery = () => {
  return useQuery({
    queryKey: queryKeys.onboarding.progress(),
    queryFn: fetchOnboardingProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Mutation for updating onboarding step
 */
export const useUpdateOnboardingStepMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (step: string) => {
      // TODO: Replace with actual repository call
      return { step };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboarding.status(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboarding.progress(),
      });
    },
  });
};

/**
 * Mutation for completing onboarding
 */
export const useCompleteOnboardingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // TODO: Replace with actual repository call
      return { completed: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboarding.status(),
      });
    },
  });
};
