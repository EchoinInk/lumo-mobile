import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ListSeparatorProps {
  height?: number;
}

export function ListSeparator({ height = 1 }: ListSeparatorProps) {
  return <View style={[styles.separator, { height }]} />;
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: '#E0E1E6',
    marginHorizontal: 16,
  },
});
