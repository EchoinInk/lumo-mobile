/**
 * Focus Mode Overlay Component
 * 
 * Overlay component for focus mode indication and controls.
 * Shows current focus mode status and exit button.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export const FocusModeOverlay: React.FC = () => {
  const { currentMode, isFocusModeActive, exitFocusMode } = useFocusMode();
  const { preferences } = useAccessibilityStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isFocusModeActive) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: preferences.reducedMotion ? 0 : 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: preferences.reducedMotion ? 0 : 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocusModeActive, preferences.reducedMotion]);

  if (!isFocusModeActive) return null;

  const getModeLabel = () => {
    switch (currentMode) {
      case 'single-task':
        return 'Single Task';
      case 'distraction-free':
        return 'Distraction Free';
      case 'today-only':
        return 'Today Only';
      case 'calm':
        return 'Calm Mode';
      default:
        return 'Focus Mode';
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.container}>
        <Text style={styles.label}>{getModeLabel()}</Text>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={exitFocusMode}
          activeOpacity={preferences.reducedMotion ? 1 : 0.7}
        >
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  exitButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  exitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
