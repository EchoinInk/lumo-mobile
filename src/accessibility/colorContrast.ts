/**
 * Color Contrast Validation
 *
 * Centralized color contrast validation for accessibility.
 */

import { ACCESSIBILITY_CONSTANTS } from "@/constants/accessibility";

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesLargeTextAA: boolean;
  passesLargeTextAAA: boolean;
}

/**
 * Calculate relative luminance of a color
 */
function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((c) => {
    const normalized = c / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(
  foreground: string,
  background: string,
): number {
  const l1 = calculateLuminance(foreground);
  const l2 = calculateLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate contrast ratio against WCAG standards
 */
export function validateContrast(
  foreground: string,
  background: string,
): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    ratio,
    passesAA: ratio >= ACCESSIBILITY_CONSTANTS.MIN_CONTRAST_RATIO,
    passesAAA: ratio >= ACCESSIBILITY_CONSTANTS.HIGH_CONTRAST_RATIO,
    passesLargeTextAA: ratio >= 3,
    passesLargeTextAAA: ratio >= 4.5,
  };
}

/**
 * Check if color combination is accessible
 */
export function isAccessibleContrast(
  foreground: string,
  background: string,
): boolean {
  const result = validateContrast(foreground, background);
  return result.passesAA;
}

/**
 * Get recommended text color for a background
 */
export function getRecommendedTextColor(
  background: string,
  isLargeText = false,
): string {
  const whiteContrast = calculateContrastRatio("#FFFFFF", background);
  const blackContrast = calculateContrastRatio("#000000", background);
  const threshold = isLargeText
    ? 3
    : ACCESSIBILITY_CONSTANTS.MIN_CONTRAST_RATIO;

  if (whiteContrast >= threshold && whiteContrast >= blackContrast) {
    return "#FFFFFF";
  }
  if (blackContrast >= threshold) {
    return "#000000";
  }
  return whiteContrast >= blackContrast ? "#FFFFFF" : "#000000";
}
