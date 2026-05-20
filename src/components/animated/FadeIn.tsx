/**
 * FadeIn Component
 * 
 * A simple fade-in animation component.
 * Subtle entrance animation that respects reduced motion.
 */

import { softFadeIn } from '@/animations/transitions';
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface FadeInProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  testID?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  style,
  delay = 0,
  testID,
}) => {
  return (
    <Animated.View
      entering={softFadeIn(delay)}
      style={style}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
};
