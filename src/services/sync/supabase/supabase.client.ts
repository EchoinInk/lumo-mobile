/**
 * Supabase Client
 *
 * Expo-compatible Supabase client initialization.
 * Uses environment variables for configuration.
 *
 * IMPORTANT: This is infrastructure only — no business logic here.
 */

import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing environment variables. " +
      "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
      "Supabase sync will be disabled until configured.",
  );
}

// SecureStore adapter for Supabase auth
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

/**
 * Supabase client instance.
 * Null if environment variables are not configured.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: ExpoSecureStoreAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

/**
 * Check if Supabase is properly configured and available.
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
