import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export function ListLoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#60646C" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
});
