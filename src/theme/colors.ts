// Neurodivergent-friendly dark theme colors
// Designed for reduced visual stress and sensory comfort

export const colors = {
  // Base backgrounds - deep, calming dark tones
  background: "#0B0C10",
  surface: "#12141A",
  surfaceElevated: "#1A1D26",
  surfacePressed: "#232634",

  // Text colors - high contrast but soft
  text: {
    primary: "#FFFFFF",
    secondary: "#A1A1AA",
    muted: "#6B7280",
    inverse: "#0B0C10",
  },

  // Accent colors - soft purple for calm focus
  accent: {
    primary: "#7C5CFF",
    soft: "#A78BFA",
    muted: "#5B4A9C",
  },

  // Semantic colors - softened for reduced visual stress
  semantic: {
    success: "#10B981",
    successSoft: "rgba(16, 185, 129, 0.15)",
    warning: "#F59E0B",
    warningSoft: "rgba(245, 158, 11, 0.15)",
    danger: "#EF4444",
    dangerSoft: "rgba(239, 68, 68, 0.15)",
    info: "#3B82F6",
    infoSoft: "rgba(59, 130, 246, 0.15)",
  },

  // Border colors - subtle separation
  border: "#232634",
  borderLight: "#2A2D3A",
  borderFocus: "#7C5CFF",

  // Overlay for modals and sheets
  overlay: "rgba(0, 0, 0, 0.7)",

  // Gradients - minimal, calming
  gradients: {
    accent: ["#7C5CFF", "#A78BFA"] as const,
    surface: ["#12141A", "#1A1D26"] as const,
  },
} as const;

// Legacy export for compatibility
export const Colors = {
  background: colors.background,
  backgroundAlt: colors.surface,
  card: colors.surfaceElevated,
  cardGlass: "rgba(26, 29, 38, 0.8)",
  primary: colors.accent.primary,
  primarySoft: colors.accent.soft,
  secondary: colors.accent.primary,
  secondarySoft: colors.accent.soft,
  accent: colors.accent.primary,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  textTertiary: colors.text.muted,
  textInverse: colors.text.inverse,
  success: colors.semantic.success,
  successSoft: colors.semantic.successSoft,
  warning: colors.semantic.warning,
  warningSoft: colors.semantic.warningSoft,
  danger: colors.semantic.danger,
  dangerSoft: colors.semantic.dangerSoft,
  info: colors.semantic.info,
  infoSoft: colors.semantic.infoSoft,
  border: colors.border,
  borderLight: colors.borderLight,
  borderDark: colors.border,
  overlay: colors.overlay,
  overlayLight: "rgba(0, 0, 0, 0.4)",
  gradientStart: colors.accent.primary,
  gradientEnd: colors.accent.soft,
} as const;

// Dark theme alias (app uses dark theme by default)
export const DarkColors = Colors;

export type ColorKey = keyof typeof Colors;
export type DarkColorKey = ColorKey;
export type ColorsType = typeof colors;
