/**
 * Root Layout
 * Handles first-run routing for onboarding
 * Wrapped with ErrorBoundary for production hardening
 */

import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  useEffect(() => {
    // Hide splash screen immediately for debugging
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return <RootLayoutContent />;
}
