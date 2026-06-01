import { useEnvironmentalSoftening } from "@/src/features/calmMode/hooks/useEnvironmentalSoftening";
import { type ReactNode, useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";

interface PlanningGentleFadeProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function PlanningGentleFade({ children, style }: PlanningGentleFadeProps) {
  const { shouldReduceMotion } = useEnvironmentalSoftening();
  const opacity = useRef(new Animated.Value(shouldReduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (shouldReduceMotion) {
      opacity.setValue(1);
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity, shouldReduceMotion]);

  return (
    <Animated.View style={[styles.container, style, { opacity }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
