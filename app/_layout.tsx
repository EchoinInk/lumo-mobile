import "@/src/global.css";
import { SyncProvider } from "@/src/providers/SyncProvider";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <SyncProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SyncProvider>
  );
}
