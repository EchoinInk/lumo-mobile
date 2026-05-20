/**
 * CelebrationPulse Component
 * 
 * A subtle pulse animation for completion moments.
 * Gentle, warm feedback without being overwhelming.
 */

import React, { useEffect } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

interface CelebrationPulseProps {
  children: React.ReactNode;
  style?: ViewStyle;
  trigger?: boolean;
  testID?: string;
}

export const CelebrationPulse: React.FC<CelebrationPulseProps> = ({
  children,
  style,
  trigger = false,
  testID,
}) => {
  const { preferences } = useAccessibilityStore();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (trigger && !preferences.reducedMotion) {
      // Gentle pulse sequence
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 200,
            easing: Easing.out(Easing.ease),
          }),
          withTiming(1, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        2, // Repeat twice
        false
      );

      opacity.value = withSequence(
        withTiming(0.8, {
          duration: 200,
        }),
        withTiming(1, {
          duration: 300,
        })
      );
    }
  }, [trigger, preferences.reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]} testID={testID}>
      {children}
    </Animated.View>
  );
};
