/**
 * Accessible Button Component
 *
 * Button component with accessibility features.
 * Minimum touch targets, haptic feedback, reduced motion support.
 */

import { accessibilityManager } from "@/accessibility";
import { ACCESSIBILITY_CONSTANTS } from "@/constants/accessibility";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import type { HapticPattern } from "@/types/accessibility";
import React from "react";
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  hapticPattern?: HapticPattern;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  disabled = false,
  hapticPattern,
  style,
  textStyle,
  testID,
}) => {
  const { preferences } = useAccessibilityStore();

  const handlePress = () => {
    if (disabled) return;

    // Trigger haptic feedback
    if (hapticPattern && preferences.hapticFeedbackEnabled) {
      accessibilityManager.triggerHaptic(hapticPattern);
    }

    onPress();
  };

  const buttonStyle = StyleSheet.flatten([
    styles.button,
    disabled && styles.disabled,
    style,
  ]);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={preferences.reducedMotion ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
      testID={testID}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: ACCESSIBILITY_CONSTANTS.MIN_TOUCH_TARGET,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    backgroundColor: "#C7C7CC",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
