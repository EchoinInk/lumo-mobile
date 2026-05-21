export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Legacy export for compatibility
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 96,
  "5xl": 128,
  "6xl": 160,
} as const;

export type SpacingKey = keyof typeof Spacing;

// Padding presets for consistent spacing
export const Padding = {
  none: 0,
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.md,
  lg: Spacing.lg,
  xl: Spacing.xl,
  "2xl": Spacing["2xl"],
} as const;

export type PaddingKey = keyof typeof Padding;
