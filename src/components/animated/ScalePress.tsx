/**
 * ScalePress Component
 * 
 * A pressable component with subtle scale animation.
 * Provides gentle tactile feedback on press.
 */

import React, { useState } from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { usePressScale } from '@/animations/presets';
import { softImpact } from '@/animations/haptics';

interface ScalePressProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ScalePress: React.FC<ScalePressProps> = ({
  children,
  style,
  hapticFeedback = true,
  onPressIn,
  onPressOut,
  testID,
  ...props
}) => {
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withTiming(pressed.value ? 0.96 : 1, {
      duration: 120,
    });
    
    return {
      transform: [{ scale }],
    };
  });

  const handlePressIn = (event: GestureResponderEvent) => {
    pressed.value = true;
    if (hapticFeedback) {
      softImpact();
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    pressed.value = false;
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
      testID={testID}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};
