/**
 * Root Layout
 * Handles first-run routing for onboarding
 * Wrapped with ErrorBoundary for production hardening
 */

import { ErrorBoundary } from "@/src/components/feedback";
import { useOnboarding } from "@/src/features/onboarding/hooks/useOnboarding";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
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

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutContent />
    </ErrorBoundary>
  );
}
