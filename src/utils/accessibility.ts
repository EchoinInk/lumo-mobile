/**
 * Accessibility Helpers
 * 
 * Reusable utilities for accessibility-first UI components.
 * Supports neurodivergent users with clear labels, predictable interactions.
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { UX } from '@/constants/ux';

/**
 * Ensures touch target meets minimum size requirements
 */
export function ensureTouchTargetSize(size: number): number {
  return Math.max(size, UX.touchTarget);
}

/**
 * Creates an accessible label combining hint and label
 */
export function createAccessibleLabel(label: string, hint?: string): string {
  if (!hint) return label;
  return `${label}, ${hint}`;
}

/**
 * Generates semantic accessibility role based on component type
 */
export function getAccessibilityRole(componentType: 'button' | 'link' | 'header' | 'text' | 'image' | 'adjustable'): string {
  const roleMap = {
    button: 'button',
    link: 'link',
    header: 'header',
    text: 'text',
    image: 'image',
    adjustable: 'adjustable',
  };
  return roleMap[componentType];
}

/**
 * Checks if reduced motion is preferred
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
}

/**
 * Checks if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    return false;
  }
}

/**
 * Creates accessibility properties for interactive elements
 */
export function createAccessibilityProps({
  label,
  hint,
  role,
  state,
  value,
}: {
  label: string;
  hint?: string;
  role?: string;
  state?: 'selected' | 'disabled' | 'checked' | 'unchecked' | 'busy' | 'expanded' | 'collapsed';
  value?: string | number;
}) {
  const accessibilityLabel = createAccessibleLabel(label, hint);
  
  return {
    accessibilityLabel,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: state ? { [state]: true } : undefined,
    accessibilityValue: value !== undefined ? { text: String(value) } : undefined,
  };
}

/**
 * Calculates appropriate font scale for dynamic type
 */
export function getScaledFontSize(baseSize: number, maxScale: number = 1.3): number {
  // This would typically use PixelRatio.getFontScale() in a component context
  // For utility usage, we provide a safe default
  return baseSize;
}

/**
 * Ensures focus order is predictable by providing consistent tab navigation
 */
export function createFocusableProps({
  isFocusable,
  focusable = true,
}: {
  isFocusable?: boolean;
  focusable?: boolean;
} = {}) {
  return {
    focusable: isFocusable ?? focusable,
    accessible: true,
  };
}

/**
 * Creates announcement for screen readers
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Handles reduced motion by returning appropriate animation duration
 */
export function getAnimationDuration(reducedMotion: boolean, duration: keyof typeof UX.animation): number {
  if (reducedMotion) {
    return 0; // Disable animation when reduced motion is enabled
  }
  return UX.animation[duration];
}

/**
 * Creates accessible press state feedback
 */
export function getPressStateStyle(pressed: boolean, reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      opacity: pressed ? UX.motion.reducedOpacity : UX.motion.defaultOpacity,
    };
  }
  
  return {
    opacity: pressed ? UX.motion.reducedOpacity : UX.motion.defaultOpacity,
    transform: [{ scale: pressed ? UX.motion.reducedScale : UX.motion.defaultScale }],
  };
}

/**
 * Validates accessibility label quality
 */
export function validateAccessibilityLabel(label: string): boolean {
  return label.length > 0 && label.length <= 200;
}

/**
 * Creates semantic heading structure for screen readers
 */
export function createHeadingProps(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return {
    accessibilityRole: 'header',
    accessibilityLevel: level,
  };
}

/**
 * Platform-specific accessibility adjustments
 */
export function getPlatformAccessibilityProps() {
  return Platform.select({
    ios: {
      accessibilityElementsHidden: false,
    },
    android: {
      importantForAccessibility: 'yes',
    },
    default: {},
  });
}
