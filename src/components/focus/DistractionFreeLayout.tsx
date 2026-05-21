/**
 * Distraction Free Layout Component
 * 
 * Layout component for distraction-free focus mode.
 * Minimizes visual noise and suppresses non-essential UI.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusMode } from '@/hooks/useFocusMode';

interface DistractionFreeLayoutProps {
  children: React.ReactNode;
}

export const DistractionFreeLayout: React.FC<DistractionFreeLayoutProps> = ({
  children,
}) => {
  const { exitFocusMode } = useFocusMode();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modeLabel}>Distraction Free</Text>
      </View>
      
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
