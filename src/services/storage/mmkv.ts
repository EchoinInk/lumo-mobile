// MMKV storage service - to be configured with proper initialization
// This is a placeholder for the MMKV singleton pattern

export const mmkv = {
  setString: (key: string, value: string) => {
    // TODO: Implement with proper MMKV initialization
    console.log('setString', key, value);
  },
  getString: (key: string) => {
    // TODO: Implement with proper MMKV initialization
    console.log('getString', key);
    return null;
  },
  setNumber: (key: string, value: number) => {
    // TODO: Implement with proper MMKV initialization
    console.log('setNumber', key, value);
  },
  getNumber: (key: string) => {
    // TODO: Implement with proper MMKV initialization
    console.log('getNumber', key);
    return null;
  },
  setBool: (key: string, value: boolean) => {
    // TODO: Implement with proper MMKV initialization
    console.log('setBool', key, value);
  },
  getBool: (key: string) => {
    // TODO: Implement with proper MMKV initialization
    console.log('getBool', key);
    return null;
  },
  delete: (key: string) => {
    // TODO: Implement with proper MMKV initialization
    console.log('delete', key);
  },
  clearAll: () => {
    // TODO: Implement with proper MMKV initialization
    console.log('clearAll');
  },
};
