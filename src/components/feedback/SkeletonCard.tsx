/**
 * SkeletonCard Component
 * 
 * Calm skeleton placeholder for cards.
 * Soft shimmer, no flashing, layout-preserving.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { Colors } from '@/theme/colors';

interface SkeletonCardProps {
  style?: any;
  lines?: number;
  testID?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  style,
  lines = 3,
  testID,
}) => {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]} testID={testID}>
      <View style={[styles.title, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
      {Array.from({ length: lines }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.line,
            { backgroundColor: isDark ? Colors.borderDark : Colors.border },
            index === lines - 1 && styles.lastLine,
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.card,
  },
  title: {
    width: '60%',
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  line: {
    width: '100%',
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  lastLine: {
    width: '80%',
  },
});
