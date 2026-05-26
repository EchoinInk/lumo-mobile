/**
 * Supabase Auth Client
 *
 * Initializes and provides the Supabase auth client.
 * Configures Expo-compatible persistence.
 * Exposes singleton client safely.
 *
 * Never import this directly outside src/services/api/auth/
 * Use the session.ts and mapper.ts abstractions instead.
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { getSupabaseConfig, isSupabaseConfigured } from "./auth.config";
import type { SupabaseAuthError } from "./supabaseAuth.types";

let supabaseClient: SupabaseClient | null = null;

/**
 * Expo SecureStore adapter for Supabase auth persistence.
 * Ensures auth tokens are stored securely on device.
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    return SecureStore.deleteItemAsync(key);
  },
};

/**
 * Initialize the Supabase auth client.
 * Creates singleton instance if not already initialized.
 *
 * @throws SupabaseAuthError if configuration is missing
 */
export function initializeSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    const error: SupabaseAuthError = {
      type: "config_missing",
      message: "Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY",
    };
    throw error;
  }

  try {
    supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable URL-based session detection for mobile
      },
    });

    return supabaseClient;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const error: SupabaseAuthError = {
      type: "auth_error",
      message: `Failed to initialize Supabase client: ${message}`,
    };
    throw error;
  }
}

/**
 * Get the Supabase auth client.
 * Initializes if not already created.
 *
 * @returns Supabase client or null if not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    return initializeSupabaseClient();
  } catch (err) {
    console.error("[SupabaseClient] Failed to get client:", err);
    return null;
  }
}

/**
 * Reset the Supabase client (useful for testing).
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}

/**
 * Check if Supabase client is available.
 */
export function isSupabaseClientAvailable(): boolean {
  return getSupabaseClient() !== null;
}
