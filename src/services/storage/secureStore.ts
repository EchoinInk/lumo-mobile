/**
 * Secure Storage Adapter
 *
 * Wraps expo-secure-store for sensitive data (auth tokens).
 * Provides a Supabase-compatible storage interface.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const WEB_STORAGE_PREFIX = 'lumo_secure_';

/**
 * Get a value from secure storage.
 * Falls back to localStorage on web.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(`${WEB_STORAGE_PREFIX}${key}`);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

/**
 * Set a value in secure storage.
 * Falls back to localStorage on web.
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(`${WEB_STORAGE_PREFIX}${key}`, value);
    } catch {
      // Silently fail on web storage errors
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Silently fail — session will be lost on restart
  }
}

/**
 * Remove a value from secure storage.
 * Falls back to localStorage on web.
 */
export async function removeSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(`${WEB_STORAGE_PREFIX}${key}`);
    } catch {
      // Silently fail
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Silently fail
  }
}

/**
 * Supabase-compatible storage adapter using expo-secure-store.
 * Passed to createClient() for secure session persistence.
 */
export const supabaseSecureStorage = {
  getItem: getSecureItem,
  setItem: setSecureItem,
  removeItem: removeSecureItem,
};
