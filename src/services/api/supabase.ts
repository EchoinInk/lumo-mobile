/**
 * Supabase Client
 *
 * Typed Supabase client with secure session persistence.
 * Sessions are stored in expo-secure-store (native) or localStorage (web).
 *
 * Environment variables:
 *   EXPO_PUBLIC_SUPABASE_URL — Supabase project URL
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY — Supabase anonymous/public key
 *
 * NEVER hardcode credentials. Use .env or app.config.ts.
 */

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseSecureStorage } from '@/services/storage/secureStore';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. ' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

/**
 * Singleton Supabase client.
 * Configured with:
 * - Secure session persistence via expo-secure-store
 * - Auto token refresh
 * - URL polyfill for React Native
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      storage: supabaseSecureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
