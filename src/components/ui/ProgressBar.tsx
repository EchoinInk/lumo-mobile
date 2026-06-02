import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Colors, Radius, Spacing } from "@/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, StyleSheet, View, ViewProps } from "react-native";
import { Text } from "./Text";

interface ProgressBarProps extends ViewProps {
  progress: number;
  showLabel?: boolean;
  label?: string;
  variant?: "default" | "gradient";
  height?: number;
}

export function ProgressBar({
  progress,
  showLabel = false,
  label,
  variant = "default",
  height = 8,
  className = "",
  style,
  ...props
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const reducedMotion = useReducedMotion();
  const animatedProgress = React.useRef(
    new Animated.Value(clampedProgress),
  ).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

  React.useEffect(() => {
    // Stop any existing animation before starting new one
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (reducedMotion) {
      // Set value immediately without animation
      animatedProgress.setValue(clampedProgress);
    } else {
      animationRef.current = Animated.timing(animatedProgress, {
        toValue: clampedProgress,
        duration: 300,
        useNativeDriver: false,
      });
      animationRef.current.start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [clampedProgress, reducedMotion]);

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const barStyle = {
    height,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    overflow: "hidden" as const,
  };

  const fillStyle = {
    height: height,
    width: progressWidth,
    borderRadius: Radius.full,
  };

  const fillContent =
    variant === "gradient" ? (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={fillStyle}
      />
    ) : (
      <Animated.View style={[fillStyle, { backgroundColor: Colors.primary }]} />
    );

  return (
    <View className={className} style={[styles.container, style]} {...props}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          <Text variant="caption" color={Colors.textSecondary}>
            {label || "Progress"}
          </Text>
          <Text variant="caption" color={Colors.textSecondary}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      )}
      <View style={barStyle}>{fillContent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
});
