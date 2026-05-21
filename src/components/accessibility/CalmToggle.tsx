/**
 * Calm Toggle Component
 * 
 * Toggle switch with calm, accessible design.
 * Supports haptic feedback and reduced motion.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { accessibilityManager } from '@/accessibility';
import type { HapticPattern } from '@/types/accessibility';

interface CalmToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  hapticPattern?: HapticPattern;
  disabled?: boolean;
}

export const CalmToggle: React.FC<CalmToggleProps> = ({
  label,
  value,
  onValueChange,
  hapticPattern,
  disabled = false,
}) => {
  const { preferences } = useAccessibilityStore();
  
  const handleToggle = () => {
    if (disabled) return;
    
    // Trigger haptic feedback
    if (hapticPattern && preferences.hapticFeedbackEnabled) {
      accessibilityManager.triggerHaptic(hapticPattern);
    }
    
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      disabled={disabled}
      activeOpacity={preferences.reducedMotion ? 1 : 0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, disabled && styles.disabled]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={handleToggle}
        disabled={disabled}
        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        ios_backgroundColor="#E5E5EA"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
  disabled: {
    color: '#8E8E93',
  },
});
