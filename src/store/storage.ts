import { createMMKV } from "react-native-mmkv";

const isServer = typeof window === "undefined";

export const storage = isServer
  ? null
  : createMMKV({
      id: "lumo-storage",
    });

export function getItem(key: string): string | null {
  if (!storage) {
    return null;
  }

  return storage.getString(key) ?? null;
}

export function setItem(key: string, value: string): void {
  if (!storage) {
    return;
  }

  storage.set(key, value);
}

export function removeItem(key: string): void {
  if (!storage) {
    return;
  }

  storage.remove(key);
}
