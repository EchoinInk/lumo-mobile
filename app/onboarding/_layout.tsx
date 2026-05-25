/**
 * Onboarding Layout
 * Configures navigation and header for onboarding flow
 */

import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
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
