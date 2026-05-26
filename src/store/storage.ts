import { Platform } from "react-native";

const isServer = typeof window === "undefined";

let storage: any = null;

// Lazy initialization to avoid module-level execution on web
function getStorage() {
  if (storage !== null) {
    return storage;
  }

  if (isServer || Platform.OS === "web") {
    // Web fallback using in-memory storage
    const inMemoryStorage = new Map<string, string>();
    storage = {
      getString: (key: string) => {
        return inMemoryStorage.get(key) ?? null;
      },
      set: (key: string, value: string) => {
        inMemoryStorage.set(key, value);
      },
      remove: (key: string) => {
        inMemoryStorage.delete(key);
      },
    };
  } else {
    // Native MMKV
    const { createMMKV } = require("react-native-mmkv");
    storage = createMMKV({
      id: "lumo-storage",
    });
  }

  return storage;
}

export const storageInstance = getStorage();

export function getItem(key: string): string | null {
  if (!storageInstance) {
    return null;
  }

  return storageInstance.getString(key) ?? null;
}

export function setItem(key: string, value: string): void {
  if (!storageInstance) {
    return;
  }

  storageInstance.set(key, value);
}

export function removeItem(key: string): void {
  if (!storageInstance) {
    return;
  }

  storageInstance.remove(key);
}
