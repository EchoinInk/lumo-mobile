import { createMMKV } from 'react-native-mmkv';

/**
 * MMKV Storage Instance
 * 
 * Centralized MMKV storage instance for the application.
 * Initialized once to avoid duplication and ensure consistency.
 */
export const storage = createMMKV();

/**
 * Get a string value from storage
 */
export const getString = (key: string): string | undefined => {
  return storage.getString(key);
};

/**
 * Set a string value in storage
 */
export const setString = (key: string, value: string): void => {
  storage.set(key, value);
};

/**
 * Get a number value from storage
 */
export const getNumber = (key: string): number | undefined => {
  return storage.getNumber(key);
};

/**
 * Set a number value in storage
 */
export const setNumber = (key: string, value: number): void => {
  storage.set(key, value);
};

/**
 * Get a boolean value from storage
 */
export const getBool = (key: string): boolean | undefined => {
  return storage.getBoolean(key);
};

/**
 * Set a boolean value in storage
 */
export const setBool = (key: string, value: boolean): void => {
  storage.set(key, value);
};

/**
 * Delete a key from storage
 */
export const deleteKey = (key: string): void => {
  storage.remove(key);
};

/**
 * Clear all keys from storage
 */
export const clearAll = (): void => {
  storage.clearAll();
};

/**
 * Check if a key exists in storage
 */
export const contains = (key: string): boolean => {
  return storage.contains(key);
};

/**
 * Get all keys from storage
 */
export const getAllKeys = (): string[] => {
  return storage.getAllKeys();
};
