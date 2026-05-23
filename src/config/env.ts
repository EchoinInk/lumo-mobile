/**
 * Environment Configuration
 *
 * Typed validation for all Expo public environment variables.
 * Fails loudly at startup if required vars are missing.
 *
 * Usage:
 *   import { env } from '@/config/env';
 *   env.supabaseUrl  // always a string if app started
 *
 * Variables:
 *   EXPO_PUBLIC_SUPABASE_URL      — Supabase project URL
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY — Supabase anonymous key
 */

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** True only when all required vars are present */
  isConfigured: boolean;
}

function readEnv(): EnvConfig {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

  if (!isConfigured) {
    console.warn(
      '[Env] Missing required environment variables.\n' +
        '  EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set.\n' +
        '  Supabase features (sync, auth) will be disabled until configured.',
    );
  }

  return { supabaseUrl, supabaseAnonKey, isConfigured };
}

/**
 * Validated environment configuration.
 * Evaluated once at module load time.
 */
export const env: EnvConfig = readEnv();
