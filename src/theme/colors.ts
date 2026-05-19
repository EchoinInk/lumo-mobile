export const Colors = {
  // Base colors
  background: '#F8F7FC',
  backgroundAlt: '#F0F0F5',
  card: '#FFFFFF',
  cardGlass: 'rgba(255, 255, 255, 0.7)',
  
  // Brand colors - soft blue/pink gradients
  primary: '#89FFFD',
  primarySoft: '#A8FFF8',
  secondary: '#EF32D9',
  secondarySoft: '#F5A8E8',
  accent: '#C084FC',
  
  // Text colors
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Semantic colors
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  info: '#3B82F6',
  infoSoft: '#DBEAFE',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Gradient colors
  gradientStart: '#89FFFD',
  gradientEnd: '#EF32D9',
  gradientBlue: '#667EEA',
  gradientPurple: '#764BA2',
  gradientWarm: '#FF6B6B',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
} as const;

export type ColorKey = keyof typeof Colors;

// Dark mode colors
export const DarkColors = {
  background: '#0F0F1A',
  backgroundAlt: '#1A1A2E',
  card: '#1E1E32',
  cardGlass: 'rgba(30, 30, 50, 0.7)',
  
  primary: '#89FFFD',
  primarySoft: '#5AD9D6',
  secondary: '#EF32D9',
  secondarySoft: '#C529AF',
  accent: '#C084FC',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#707080',
  textInverse: '#1A1A2E',
  
  success: '#34D399',
  successSoft: '#064E3B',
  warning: '#FBBF24',
  warningSoft: '#78350F',
  danger: '#F87171',
  dangerSoft: '#7F1D1D',
  info: '#60A5FA',
  infoSoft: '#1E3A8A',
  
  border: '#2A2A3E',
  borderLight: '#3A3A4E',
  borderDark: '#1A1A2E',
  
  gradientStart: '#89FFFD',
  gradientEnd: '#EF32D9',
  gradientBlue: '#667EEA',
  gradientPurple: '#764BA2',
  gradientWarm: '#FF6B6B',
  
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
} as const;

export type DarkColorKey = keyof typeof DarkColors;
