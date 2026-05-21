/**
 * Focus Container Component
 * 
 * Container component that respects focus mode.
 * Hides content based on current focus mode and element priority.
 */

import React from 'react';
import { View, ViewProps } from 'react-native';
import { useFocusModeStore } from '@/store/useFocusModeStore';

interface FocusContainerProps extends ViewProps {
  children: React.ReactNode;
  priority: 'primary' | 'secondary' | 'tertiary';
  hideInFocusMode?: boolean;
}

export const FocusContainer: React.FC<FocusContainerProps> = ({
  children,
  priority,
  hideInFocusMode = false,
  style,
  ...props
}) => {
  const { currentMode, isFocusModeActive } = useFocusModeStore();
  
  // Determine if element should be visible
  const shouldShow = () => {
    if (!isFocusModeActive) return true;
    if (hideInFocusMode) return false;
    
    switch (currentMode) {
      case 'single-task':
        return priority === 'primary';
      case 'distraction-free':
        return priority === 'primary';
      case 'today-only':
        return priority === 'primary' || priority === 'secondary';
      case 'calm':
        return true;
      default:
        return true;
    }
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = {
  container: {},
};
