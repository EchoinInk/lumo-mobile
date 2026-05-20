/**
 * SharedTransitionCard Component
 * 
 * A card component with shared element transition support.
 * For smooth navigation between screens with card continuity.
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, { SharedTransition, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { Colors } from '@/theme/colors';

interface SharedTransitionCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  sharedTransitionTag: string;
  testID?: string;
}

export const SharedTransitionCard: React.FC<SharedTransitionCardProps> = ({
  children,
  style,
  sharedTransitionTag,
  testID,
}) => {
  const { isDark } = useTheme();

  const sharedTransition = SharedTransition.custom((values) => {
    'worklet';
    
    return {
      duration: 300,
      easing: (t: number) => {
        // Gentle easing function
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      },
    };
  });

  const cardStyle = [
    styles.card,
    {
      backgroundColor: isDark ? Colors.card : Colors.card,
      shadowColor: isDark ? '#000' : '#000',
    },
    style,
  ];

  return (
    <Animated.View
      style={cardStyle}
      sharedTransitionTag={sharedTransitionTag}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});
