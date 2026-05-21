/**
 * Calm Mode View Component
 * 
 * View component for calm focus mode.
 * Softens visuals, reduces motion, and lowers interaction density.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export const CalmModeView: React.FC = () => {
  const { exitFocusMode } = useFocusMode();
  const { preferences } = useAccessibilityStore();

  return (
    <View style={styles.container}>
      <View style={[styles.header, styles.calmHeader]}>
        <Text style={styles.modeLabel}>Calm Mode</Text>
        <Text style={styles.subtitle}>Softer visuals, reduced stimulation</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>
          Take your time. There's no rush.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  calmHeader: {
    backgroundColor: '#5C9CE6',
  },
  modeLabel: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 28,
  },
});
