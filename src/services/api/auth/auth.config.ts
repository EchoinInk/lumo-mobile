/**
 * Auth Configuration
 *
 * Validates and provides Supabase auth configuration.
 * Fails gracefully in development if env vars are missing.
 *
 * Environment variables required:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

import { env } from "@/config/env";

interface AuthConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

let cachedConfig: AuthConfig | null = null;

/**
 * Get Supabase auth configuration.
 * Caches result for performance.
 */
export function getSupabaseConfig(): AuthConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const { supabaseUrl, supabaseAnonKey, isConfigured } = env;

  cachedConfig = {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured,
  };

  if (!isConfigured && __DEV__) {
    console.warn(
      "[AuthConfig] Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
    );
  }

  return cachedConfig;
}

/**
 * Check if Supabase is properly configured.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

/**
 * Reset cached configuration (useful for testing).
 */
export function resetAuthConfig(): void {
  cachedConfig = null;
}
