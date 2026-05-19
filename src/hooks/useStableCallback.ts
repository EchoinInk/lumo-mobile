import { useCallback } from 'react';

export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = []
): T {
  return useCallback(callback, deps) as T;
}
