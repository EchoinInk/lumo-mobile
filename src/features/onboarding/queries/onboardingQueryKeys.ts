/**
 * Onboarding Query Keys
 * 
 * Feature-specific query keys for onboarding.
 * Extends centralized query keys with onboarding-specific helpers.
 */

import { queryKeys } from '@/services/query';

export const onboardingQueryKeys = {
  ...queryKeys.onboarding,
  
  // Additional onboarding-specific keys
  step: (step: string) => ['onboarding', 'step', step] as const,
  preferences: () => ['onboarding', 'preferences'] as const,
} as const;
