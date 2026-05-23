import type { StateStorage } from "zustand/middleware";

import {
  getItem,
  removeItem,
  setItem,
} from "./storage";

export const createPersistStorage = (): StateStorage => ({
  getItem: async (name) => {
    return getItem(name);
  },

  setItem: async (name, value) => {
    setItem(name, value);
  },

  removeItem: async (name) => {
    removeItem(name);
  },
});