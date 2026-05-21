/**
 * Dynamic Text Component
 * 
 * Text component that respects system font scaling and accessibility preferences.
 * Supports adaptive spacing and layout preservation.
 */

import React from 'react';
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { accessibilityConfig } from '@/accessibility';
import type { FontScale } from '@/types/accessibility';

interface DynamicTextProps extends RNTextProps {
  children: React.ReactNode;
  scale?: FontScale;
  adaptiveSpacing?: boolean;
  preserveLayout?: boolean;
}

export const DynamicText: React.FC<DynamicTextProps> = ({
  children,
  scale,
  adaptiveSpacing = true,
  preserveLayout = true,
  style,
  ...props
}) => {
  const { preferences } = useAccessibilityStore();
  
  // Determine font scale
  const fontScale = scale || (preferences.largeText ? 'large' : 'medium');
  const scaleMultiplier = accessibilityConfig.getFontScaleMultiplier(fontScale);
  
  // Calculate adaptive spacing
  const adaptiveStyle = adaptiveSpacing
    ? {
        lineHeight: (props.numberOfLines ? 24 : 28) * scaleMultiplier,
        letterSpacing: scaleMultiplier > 1.2 ? 0.5 : 0,
      }
    : {};

  // Apply style
  const textStyle = StyleSheet.flatten([
    styles.text,
    { fontSize: 16 * scaleMultiplier },
    adaptiveStyle,
    style,
  ]);

  return (
    <RNText
      style={textStyle}
      allowFontScaling={true}
      adjustsFontSizeToFit={preserveLayout}
      numberOfLines={preserveLayout ? props.numberOfLines : undefined}
      ellipsizeMode="tail"
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#000',
  },
});
