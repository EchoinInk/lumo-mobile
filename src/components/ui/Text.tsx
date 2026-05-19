import { Colors, Typography } from '@/theme/tokens';
import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';

type TextVariant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'bodyLarge' | 'caption' | 'small' | 'label';

interface TextPropsExtended extends TextProps {
  variant?: TextVariant;
  color?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Text({ 
  variant = 'body', 
  color = Colors.textPrimary,
  textAlign = 'left',
  className = '',
  children, 
  style,
  ...props 
}: TextPropsExtended) {
  const typographyStyle = Typography[variant] || Typography.body;

  return (
    <RNText
      className={className}
      style={[
        styles.text,
        {
          ...typographyStyle,
          color,
          textAlign,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    // Base text styles
  },
});
