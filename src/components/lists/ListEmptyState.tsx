import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ListEmptyStateProps {
  message?: string;
}

export function ListEmptyState({ message = 'No items found' }: ListEmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 16,
    color: '#60646C',
    textAlign: 'center',
    lineHeight: 24,
  },
});
