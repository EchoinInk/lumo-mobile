/**
 * Habits Query Hooks
 * 
 * React Query hooks for habits feature.
 * Remote cache for Supabase data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query';

// Mock fetch function - replace with actual repository call
const fetchHabits = async () => {
  // TODO: Replace with actual repository call
  return [];
};

const fetchHabitById = async (id: string) => {
  // TODO: Replace with actual repository call
  return null;
};

/**
 * Query for all habits
 */
export const useHabitsQuery = () => {
  return useQuery({
    queryKey: queryKeys.habits.lists(),
    queryFn: fetchHabits,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Query for single habit
 */
export const useHabitDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.habits.detail(id),
    queryFn: () => fetchHabitById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Mutation for creating habit
 */
export const useCreateHabitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: any) => {
      // TODO: Replace with actual repository call
      return habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.habits.lists(),
      });
    },
  });
};

/**
 * Mutation for updating habit
 */
export const useUpdateHabitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // TODO: Replace with actual repository call
      return { id, ...updates };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.habits.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.habits.lists(),
      });
    },
  });
};

/**
 * Mutation for deleting habit
 */
export const useDeleteHabitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual repository call
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.habits.lists(),
      });
    },
  });
};
