export interface MockStorage {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string | number | boolean) => void;
  remove: (key: string) => void;
  clearAll: () => void;
  getAllKeys: () => string[];
}

export function createMockStorage(initialState?: Record<string, string>): MockStorage {
  const values = new Map<string, string>(Object.entries(initialState ?? {}));

  return {
    getString: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, String(value));
    },
    remove: (key) => {
      values.delete(key);
    },
    clearAll: () => {
      values.clear();
    },
    getAllKeys: () => Array.from(values.keys()),
  };
}
