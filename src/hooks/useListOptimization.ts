import { useMemo } from 'react';

interface ListOptimizationOptions {
  estimatedItemSize?: number;
  removeClippedSubviews?: boolean;
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
}

export function useListOptimization<T>(
  keyExtractor: (item: T, index: number) => string,
  options: ListOptimizationOptions = {}
) {
  const {
    estimatedItemSize = 96,
    removeClippedSubviews = true,
    windowSize = 21,
    initialNumToRender = 10,
    maxToRenderPerBatch = 5,
  } = options;

  const optimizedProps = useMemo(
    () => ({
      estimatedItemSize,
      removeClippedSubviews,
      windowSize,
      initialNumToRender,
      maxToRenderPerBatch,
      keyExtractor,
    }),
    [estimatedItemSize, removeClippedSubviews, windowSize, initialNumToRender, maxToRenderPerBatch, keyExtractor]
  );

  return optimizedProps;
}
