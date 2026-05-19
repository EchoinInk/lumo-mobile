import { createMMKV } from 'react-native-mmkv';

// MMKV storage instance
export const storage = createMMKV();

/**
 * Get an item from storage
 * @param key - The storage key
 * @returns The stored value or null if not found
 */
export const getItem = <T>(key: string): T | null => {
  try {
    const value = storage.getString(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error(`Error getting item from storage for key "${key}":`, error);
    return null;
  }
};

/**
 * Set an item in storage
 * @param key - The storage key
 * @param value - The value to store
 */
export const setItem = <T>(key: string, value: T): void => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in storage for key "${key}":`, error);
  }
};

/**
 * Remove an item from storage
 * @param key - The storage key
 */
export const removeItem = (key: string): void => {
  try {
    storage.remove(key);
  } catch (error) {
    console.error(`Error removing item from storage for key "${key}":`, error);
  }
};

/**
 * Check if a key exists in storage
 * @param key - The storage key
 * @returns True if the key exists
 */
export const hasItem = (key: string): boolean => {
  try {
    return storage.contains(key);
  } catch (error) {
    console.error(`Error checking if key exists in storage for key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all items from storage
 */
export const clearAll = (): void => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error('Error clearing all items from storage:', error);
  }
};

/**
 * Get all keys from storage
 * @returns Array of all storage keys
 */
export const getAllKeys = (): string[] => {
  try {
    return storage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys from storage:', error);
    return [];
  }
};
