/**
 * Root Layout
 * Handles first-run routing for onboarding
 */

import { useOnboarding } from "@/src/features/onboarding/hooks/useOnboarding";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isHydrated, isComplete } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isHydrated) return;

    // Hide splash screen once hydrated
    SplashScreen.hideAsync();

    const inOnboarding = segments[0] === "onboarding";

    if (!isComplete && !inOnboarding) {
      // First run - redirect to onboarding
      router.replace("/onboarding");
    } else if (isComplete && inOnboarding) {
      // Completed onboarding - redirect to main app
      router.replace("/(tabs)");
    }
  }, [isHydrated, isComplete, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
