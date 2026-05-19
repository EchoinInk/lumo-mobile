/**
 * UX Design Constraints
 * 
 * Neurodivergent-first UX system with token-backed values.
 * Prioritizes cognitive clarity, predictable interactions, and calm spacing.
 */

import { Spacing } from '@/theme/tokens';

export const UX = {
  // Touch target sizing (WCAG 2.5.5: minimum 44x44)
  touchTarget: 44,
  touchTargetLarge: 48,

  // Animation durations (calm, predictable timing)
  animation: {
    fast: 120,
    normal: 180,
    slow: 260,
    slower: 340,
  },

  // Spacing rhythm (breathable, comfortable spacing)
  spacing: {
    comfortable: Spacing.md, // 16
    relaxed: Spacing.lg, // 24
    large: Spacing.xl, // 32
    extraLarge: Spacing['2xl'], // 48
  },

  // Content constraints (prevent cognitive overload)
  content: {
    maxWidth: 800,
    maxPrimaryActions: 3,
    maxVisibleSections: 5,
    maxItemsPerGroup: 7,
  },

  // Hierarchy depth (keep navigation simple)
  hierarchy: {
    maxNestingDepth: 3,
    maxTabs: 5,
    maxBreadcrumbs: 3,
  },

  // Card density rules (breathable layouts)
  card: {
    minPadding: Spacing.lg, // 24
    preferredPadding: Spacing.xl, // 32
    maxContentLines: 4,
    minTouchHeight: 48,
  },

  // Form constraints (keep forms lightweight)
  form: {
    maxFieldsPerSection: 5,
    maxSections: 3,
    preferredInputHeight: 48,
    minLabelSpacing: Spacing.sm, // 8
  },

  // Reduced motion defaults
  motion: {
    reducedScale: 0.95,
    defaultScale: 1,
    reducedOpacity: 0.7,
    defaultOpacity: 1,
  },

  // Interaction timing (predictable, calm feedback)
  interaction: {
    pressFeedbackDuration: 150,
    hoverFeedbackDuration: 200,
    focusRingDuration: 180,
  },

  // Focus behavior (clear, predictable focus)
  focus: {
    ringWidth: 2,
    ringOffset: 2,
    ringColor: '#89FFFD',
  },

  // Typography constraints (readable, scannable)
  typography: {
    maxLineLength: 75,
    preferredLineHeight: 1.5,
    minBodySize: 16,
  },
} as const;

export type UXKey = keyof typeof UX;
