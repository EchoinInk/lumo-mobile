import { StateStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from './storage';

/**
 * Creates a Zustand persist storage adapter using MMKV
 * @param name - The storage key name
 * @returns A StateStorage implementation for Zustand persist middleware
 */
export const createPersistStorage = (name: string): StateStorage => ({
  getItem: (key: string) => {
    const storageKey = `${name}_${key}`;
    const value = getItem<string>(storageKey);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    const storageKey = `${name}_${key}`;
    setItem(storageKey, value);
  },
  removeItem: (key: string) => {
    const storageKey = `${name}_${key}`;
    removeItem(storageKey);
  },
});
