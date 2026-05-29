/**
 * Onboarding Layout
 * Configures navigation and header for onboarding flow
 */

import { Stack } from "expo-router";
import { useEffect } from "react";
import { observability } from "@/src/services/observability";
import { useOnboardingStore } from "@/src/features/onboarding/store/useOnboardingStore";

export default function OnboardingLayout() {
  useEffect(() => {
    observability.analytics.track("onboarding_started");
    const measurementId = observability.performance.startMeasurement(
      "onboarding.completion_duration",
    );

    return () => {
      const { isComplete } = useOnboardingStore.getState();
      if (isComplete) {
        observability.performance.endMeasurement(measurementId);
        return;
      }

      observability.analytics.track("onboarding_abandoned");
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="planning"
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="focus"
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="complete"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
