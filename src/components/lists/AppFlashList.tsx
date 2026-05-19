import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, StyleSheet } from 'react-native';
import { ListEmptyState } from './ListEmptyState';
import { ListLoadingState } from './ListLoadingState';

interface AppFlashListProps<T> {
  data: T[] | null | undefined;
  estimatedItemSize?: number;
  emptyStateMessage?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  renderItem: (info: { item: T; index: number }) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  contentContainerStyle?: any;
}

export function AppFlashList<T>({
  estimatedItemSize = 96,
  emptyStateMessage = 'No items found',
  isLoading = false,
  onRefresh,
  refreshing = false,
  data,
  contentContainerStyle,
  renderItem,
  keyExtractor,
  ...props
}: AppFlashListProps<T>) {
  const isEmpty = data && data.length === 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlashList
        data={data}
        estimatedItemSize={estimatedItemSize}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          isLoading ? (
            <ListLoadingState />
          ) : (
            <ListEmptyState message={emptyStateMessage} />
          )
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.contentContainer,
          isEmpty && styles.emptyContainer,
          contentContainerStyle,
        ]}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        {...(props as any)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
