import "@/src/global.css";
import { SyncProvider } from "@/src/providers/SyncProvider";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Stack } from "expo-router";

export default function RootLayout() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  return (
    <SyncProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SyncProvider>
  );
}
